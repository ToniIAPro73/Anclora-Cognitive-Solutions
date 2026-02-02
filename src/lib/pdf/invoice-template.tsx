import {
  Document,
  Page,
  Text,
  View,
} from '@react-pdf/renderer'
import { styles, colors, companyInfo } from './styles'
import type { InvoiceWithProject, InvoiceLineItem } from '@/types/database.types'

interface InvoicePDFProps {
  invoice: InvoiceWithProject
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

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const lineItems = (invoice.line_items as InvoiceLineItem[]) || []
  const client = invoice.projects?.clients

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
            <Text style={styles.documentTitle}>FACTURA</Text>
            <Text style={styles.documentNumber}>{invoice.invoice_number}</Text>
          </View>
        </View>

        {/* Client & Invoice Info */}
        <View style={styles.twoColumn}>
          {/* Client Info */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Facturar a:</Text>
            <View style={styles.infoBox}>
              <Text style={[styles.infoValue, styles.mb10]}>
                {client?.company_name || 'Cliente'}
              </Text>
              {client?.nif_cif && (
                <Text style={styles.companyDetail}>NIF/CIF: {client.nif_cif}</Text>
              )}
              {client?.address && (
                <Text style={styles.companyDetail}>{client.address}</Text>
              )}
              {client?.email && (
                <Text style={styles.companyDetail}>{client.email}</Text>
              )}
              {client?.phone && (
                <Text style={styles.companyDetail}>{client.phone}</Text>
              )}
            </View>
          </View>

          {/* Invoice Details */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Detalles:</Text>
            <View style={styles.infoBox}>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.infoLabel}>Fecha de emisión</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.issue_date)}</Text>
              </View>
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
                <Text style={styles.infoValue}>{formatDate(invoice.due_date)}</Text>
              </View>
              <View>
                <Text style={styles.infoLabel}>Proyecto</Text>
                <Text style={styles.infoValue}>
                  {invoice.projects?.project_name || 'Sin proyecto'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDescription]}>
              Descripción
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colQuantity]}>
              Cantidad
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>
              Precio Unit.
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colAmount]}>
              Importe
            </Text>
          </View>

          {/* Table Rows */}
          {lineItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 1 ? styles.tableRowAlt : {},
              ]}
            >
              <Text style={[styles.tableCell, styles.colDescription]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.colQuantity, styles.tableCellRight]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.colPrice, styles.tableCellRight]}>
                {formatCurrency(item.unit_price)}
              </Text>
              <Text style={[styles.tableCell, styles.colAmount, styles.tableCellRight]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsContainer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (21%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(invoice.iva)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>TOTAL</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(invoice.total)}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={[styles.notesSection, styles.mt20]}>
          <Text style={styles.notesTitle}>Datos de pago</Text>
          <Text style={styles.notesText}>
            Titular: {companyInfo.name}
          </Text>
          <Text style={styles.notesText}>
            IBAN: {companyInfo.iban}
          </Text>
          <Text style={styles.notesText}>
            Concepto: {invoice.invoice_number}
          </Text>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={[styles.notesSection, styles.mt10]}>
            <Text style={styles.notesTitle}>Notas</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {companyInfo.name} | {companyInfo.email} | {companyInfo.phone}
          </Text>
          <Text style={[styles.footerText, styles.mt10]}>
            Factura generada electrónicamente. Válida sin firma según RD 1619/2012.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
