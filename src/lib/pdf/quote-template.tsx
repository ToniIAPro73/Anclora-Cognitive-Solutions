import {
  Document,
  Page,
  Text,
  View,
} from '@react-pdf/renderer'
import { styles, colors, companyInfo } from './styles'
import type { QuoteWithProject, QuoteContent, QuoteService } from '@/types/database.types'

interface QuotePDFProps {
  quote: QuoteWithProject
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function QuotePDF({ quote }: QuotePDFProps) {
  const content = quote.content_json as QuoteContent
  const services = content?.services || []
  const client = quote.projects?.clients
  const project = quote.projects

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetail}>{companyInfo.address}</Text>
            <Text style={styles.companyDetail}>{companyInfo.city}</Text>
            <Text style={styles.companyDetail}>NIF: {companyInfo.nif}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.documentTitle}>PRESUPUESTO</Text>
            <Text style={styles.documentNumber}>
              Versión {quote.version}
            </Text>
            <Text style={[styles.companyDetail, styles.mt10]}>
              {formatDate(quote.created_at)}
            </Text>
          </View>
        </View>

        {/* Client & Project Info */}
        <View style={styles.twoColumn}>
          {/* Client Info */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Para:</Text>
            <View style={styles.infoBox}>
              <Text style={[styles.infoValue, styles.mb10]}>
                {client?.company_name || 'Cliente'}
              </Text>
              {client?.contact_person && (
                <Text style={styles.companyDetail}>
                  Attn: {client.contact_person}
                </Text>
              )}
              {client?.email && (
                <Text style={styles.companyDetail}>{client.email}</Text>
              )}
              {client?.phone && (
                <Text style={styles.companyDetail}>{client.phone}</Text>
              )}
            </View>
          </View>

          {/* Project Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Proyecto:</Text>
            <View style={styles.infoBox}>
              <Text style={[styles.infoValue, styles.mb10]}>
                {project?.project_name || 'Sin nombre'}
              </Text>
              {project?.description && (
                <Text style={[styles.companyDetail, { lineHeight: 1.4 }]}>
                  {project.description.substring(0, 200)}
                  {project.description.length > 200 ? '...' : ''}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Introduction */}
        {content?.introduction && (
          <View style={styles.mb20}>
            <Text style={styles.sectionTitle}>Introducción</Text>
            <Text style={[styles.notesText, { lineHeight: 1.6 }]}>
              {content.introduction}
            </Text>
          </View>
        )}

        {/* Services Table */}
        <View style={styles.table}>
          <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
            Servicios propuestos
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>
              Servicio
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '15%', textAlign: 'right' }]}>
              Horas
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '20%', textAlign: 'right' }]}>
              Tarifa/h
            </Text>
            <Text style={[styles.tableHeaderCell, { width: '25%', textAlign: 'right' }]}>
              Importe
            </Text>
          </View>

          {/* Table Rows */}
          {services.map((service: QuoteService, index: number) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <View style={{ width: '40%' }}>
                <Text style={[styles.tableCell, styles.textBold]}>
                  {service.name}
                </Text>
                {service.description && (
                  <Text style={[styles.tableCell, styles.textMuted, styles.textSmall, { marginTop: 2 }]}>
                    {service.description.substring(0, 100)}
                    {service.description.length > 100 ? '...' : ''}
                  </Text>
                )}
              </View>
              <Text style={[styles.tableCell, { width: '15%', textAlign: 'right' }]}>
                {service.hours}h
              </Text>
              <Text style={[styles.tableCell, { width: '20%', textAlign: 'right' }]}>
                {formatCurrency(service.hourly_rate)}
              </Text>
              <Text style={[styles.tableCell, { width: '25%', textAlign: 'right' }]}>
                {formatCurrency(service.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (21%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.iva)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Timeline */}
        {content?.timeline && (
          <View style={[styles.notesSection, styles.mt20]}>
            <Text style={styles.notesTitle}>Plazo de ejecución</Text>
            <Text style={styles.notesText}>{content.timeline}</Text>
          </View>
        )}

        {/* Payment Terms */}
        {content?.payment_terms && (
          <View style={[styles.notesSection, styles.mt10]}>
            <Text style={styles.notesTitle}>Condiciones de pago</Text>
            <Text style={styles.notesText}>{content.payment_terms}</Text>
          </View>
        )}

        {/* Conclusion */}
        {content?.conclusion && (
          <View style={[styles.notesSection, styles.mt10]}>
            <Text style={styles.notesTitle}>Conclusión</Text>
            <Text style={styles.notesText}>{content.conclusion}</Text>
          </View>
        )}

        {/* Validity Notice */}
        <View style={[styles.mt20, { padding: 10, backgroundColor: colors.secondary + '20', borderRadius: 4 }]}>
          <Text style={[styles.textSmall, styles.textCenter, { color: colors.primary }]}>
            Este presupuesto tiene una validez de 30 días desde la fecha de emisión.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {companyInfo.name} | {companyInfo.email} | {companyInfo.phone}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
