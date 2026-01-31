import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build errors
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: {
        schema: 'anclora'
      }
    }
  )
}

interface AlertToCreate {
  type: 'deadline_approaching' | 'budget_exceeded' | 'invoice_overdue' | 'project_stale' | 'client_inactive'
  priority: 'low' | 'medium' | 'high' | 'critical'
  message: string
  project_id?: string
  client_id?: string
}

export async function GET(request: NextRequest) {
  // Verify cron secret for security (optional but recommended)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabaseAdmin = getSupabaseAdmin()
    const alertsToCreate: AlertToCreate[] = []
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // 1. DEADLINE APPROACHING (< 7 days)
    const sevenDaysFromNow = new Date(now)
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
    const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0]

    const { data: projectsApproachingDeadline } = await supabaseAdmin
      .from('projects')
      .select('project_id, project_name, deadline, client_id')
      .not('status', 'in', '("completed","cancelled")')
      .eq('archived', false)
      .not('deadline', 'is', null)
      .lte('deadline', sevenDaysStr)
      .gte('deadline', today)

    for (const project of projectsApproachingDeadline || []) {
      const deadline = new Date(project.deadline)
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      alertsToCreate.push({
        type: 'deadline_approaching',
        priority: daysLeft <= 2 ? 'critical' : daysLeft <= 4 ? 'high' : 'medium',
        message: `El proyecto "${project.project_name}" tiene deadline en ${daysLeft} día${daysLeft !== 1 ? 's' : ''} (${project.deadline})`,
        project_id: project.project_id,
        client_id: project.client_id,
      })
    }

    // 2. INVOICE OVERDUE (due_date < today and status = 'sent')
    const { data: overdueInvoices } = await supabaseAdmin
      .from('invoices')
      .select(`
        invoice_id,
        invoice_number,
        due_date,
        total,
        project_id,
        projects!inner(project_name, client_id)
      `)
      .eq('status', 'sent')
      .lt('due_date', today)

    for (const invoice of overdueInvoices || []) {
      const dueDate = new Date(invoice.due_date)
      const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      const project = invoice.projects as any

      // Update invoice status to overdue
      await supabaseAdmin
        .from('invoices')
        .update({ status: 'overdue' })
        .eq('invoice_id', invoice.invoice_id)

      alertsToCreate.push({
        type: 'invoice_overdue',
        priority: daysOverdue > 30 ? 'critical' : daysOverdue > 14 ? 'high' : 'medium',
        message: `Factura ${invoice.invoice_number} vencida hace ${daysOverdue} día${daysOverdue !== 1 ? 's' : ''} (${invoice.total}€)`,
        project_id: invoice.project_id,
        client_id: project?.client_id,
      })
    }

    // 3. PROJECT STALE (no updates in 14 days, active status)
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const fourteenDaysStr = fourteenDaysAgo.toISOString()

    const { data: staleProjects } = await supabaseAdmin
      .from('projects')
      .select('project_id, project_name, updated_at, client_id')
      .in('status', ['in_progress', 'testing'])
      .eq('archived', false)
      .lt('updated_at', fourteenDaysStr)

    for (const project of staleProjects || []) {
      const lastUpdate = new Date(project.updated_at)
      const daysSinceUpdate = Math.ceil((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24))

      alertsToCreate.push({
        type: 'project_stale',
        priority: daysSinceUpdate > 30 ? 'high' : 'medium',
        message: `El proyecto "${project.project_name}" no tiene actividad desde hace ${daysSinceUpdate} días`,
        project_id: project.project_id,
        client_id: project.client_id,
      })
    }

    // 4. CLIENT INACTIVE (no active projects in 90 days)
    const ninetyDaysAgo = new Date(now)
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    const ninetyDaysStr = ninetyDaysAgo.toISOString()

    const { data: allClients } = await supabaseAdmin
      .from('clients')
      .select('client_id, company_name')

    for (const client of allClients || []) {
      // Check if client has any recent active projects
      const { data: recentProjects, count } = await supabaseAdmin
        .from('projects')
        .select('project_id', { count: 'exact', head: true })
        .eq('client_id', client.client_id)
        .or(`created_at.gte.${ninetyDaysStr},updated_at.gte.${ninetyDaysStr}`)
        .not('status', 'in', '("completed","cancelled")')

      if (count === 0) {
        // Check last activity
        const { data: lastProject } = await supabaseAdmin
          .from('projects')
          .select('updated_at')
          .eq('client_id', client.client_id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .single()

        if (lastProject) {
          const lastActivity = new Date(lastProject.updated_at)
          const daysSinceActivity = Math.ceil((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

          alertsToCreate.push({
            type: 'client_inactive',
            priority: 'low',
            message: `El cliente "${client.company_name}" no tiene actividad desde hace ${daysSinceActivity} días`,
            client_id: client.client_id,
          })
        }
      }
    }

    // Deduplicate: Check existing unresolved alerts to avoid duplicates
    const insertedAlerts: AlertToCreate[] = []

    for (const alert of alertsToCreate) {
      // Check if similar unresolved alert exists
      const { data: existingAlert } = await supabaseAdmin
        .from('alerts')
        .select('alert_id')
        .eq('type', alert.type)
        .is('resolved_at', null)
        .eq(alert.project_id ? 'project_id' : 'client_id', alert.project_id || alert.client_id)
        .limit(1)
        .single()

      if (!existingAlert) {
        const { error } = await supabaseAdmin
          .from('alerts')
          .insert({
            type: alert.type,
            priority: alert.priority,
            message: alert.message,
            project_id: alert.project_id || null,
            client_id: alert.client_id || null,
            is_read: false,
          })

        if (!error) {
          insertedAlerts.push(alert)
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      stats: {
        deadline_approaching: alertsToCreate.filter(a => a.type === 'deadline_approaching').length,
        invoice_overdue: alertsToCreate.filter(a => a.type === 'invoice_overdue').length,
        project_stale: alertsToCreate.filter(a => a.type === 'project_stale').length,
        client_inactive: alertsToCreate.filter(a => a.type === 'client_inactive').length,
      },
      alertsChecked: alertsToCreate.length,
      alertsCreated: insertedAlerts.length,
    })
  } catch (error) {
    console.error('Error generating alerts:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error generating alerts' },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
