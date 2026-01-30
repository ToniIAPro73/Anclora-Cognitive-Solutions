import { StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts (using system fonts as fallback)
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

// Brand colors
export const colors = {
  primary: '#192350',      // Dark Blue
  secondary: '#AFD2FA',    // Light Blue
  accent: '#D4AF37',       // Gold
  background: '#F5F5F0',   // Off-White
  white: '#FFFFFF',
  black: '#1a1a1a',
  gray: '#6b7280',
  lightGray: '#e5e7eb',
  success: '#10b981',
  error: '#ef4444',
}

// Common styles
export const styles = StyleSheet.create({
  // Page
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 40,
    backgroundColor: colors.white,
    color: colors.black,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  logo: {
    width: 120,
    height: 40,
  },
  headerRight: {
    textAlign: 'right',
  },
  documentTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 12,
    color: colors.gray,
  },

  // Company Info
  companyInfo: {
    marginBottom: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 4,
  },
  companyDetail: {
    fontSize: 9,
    color: colors.gray,
    marginBottom: 2,
  },

  // Two Column Layout
  twoColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  column: {
    width: '48%',
  },

  // Info Box
  infoBox: {
    backgroundColor: colors.background,
    padding: 15,
    borderRadius: 4,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 8,
    color: colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 600,
    color: colors.black,
  },

  // Section Title
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 10,
    marginTop: 20,
  },

  // Table
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
    padding: 10,
  },
  tableRowAlt: {
    backgroundColor: colors.background,
  },
  tableCell: {
    fontSize: 10,
    color: colors.black,
  },
  tableCellRight: {
    textAlign: 'right',
  },

  // Column widths for items table
  colDescription: { width: '45%' },
  colQuantity: { width: '15%', textAlign: 'right' },
  colPrice: { width: '20%', textAlign: 'right' },
  colAmount: { width: '20%', textAlign: 'right' },

  // Totals
  totalsContainer: {
    marginTop: 20,
    marginLeft: 'auto',
    width: 250,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  totalLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 600,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: colors.white,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: colors.accent,
  },

  // Notes
  notesSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.primary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 9,
    color: colors.gray,
    lineHeight: 1.5,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  footerText: {
    fontSize: 8,
    color: colors.gray,
  },

  // Status Badge
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 600,
  },
  statusDraft: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },
  statusSent: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  statusPaid: {
    backgroundColor: '#dcfce7',
    color: '#15803d',
  },
  statusOverdue: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
  },

  // Text styles
  textBold: {
    fontWeight: 700,
  },
  textMuted: {
    color: colors.gray,
  },
  textSmall: {
    fontSize: 8,
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },

  // Spacing
  mb10: { marginBottom: 10 },
  mb20: { marginBottom: 20 },
  mt10: { marginTop: 10 },
  mt20: { marginTop: 20 },
})

// Company data (would come from env or config in production)
export const companyInfo = {
  name: 'Anclora Cognitive Solutions',
  nif: 'B-12345678',
  address: 'Calle Ejemplo, 123',
  city: '08001 Barcelona, España',
  email: 'hola@anclora.com',
  phone: '+34 900 123 456',
  iban: 'ES12 1234 5678 9012 3456 7890',
}
