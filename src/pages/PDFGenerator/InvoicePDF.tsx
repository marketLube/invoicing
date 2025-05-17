import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Invoice, PaymentInfo } from '../../types';
import { formatCurrency, formatDate, calculateItemTotal } from '../../utils/helpers';

// Register Roboto font with CDN URLs
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 'medium',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/roboto-font@0.1.0/fonts/Roboto/roboto-italic-webfont.ttf',
      fontStyle: 'italic',
    }
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 10,
    padding: '24mm',
    color: '#333333',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  contentWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerLeft: {
    width: '55%',
  },
  headerRight: {
    width: '40%',
    paddingTop: 4,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 8,
  },
  companyDetails: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  invoiceDetails: {
    marginTop: 8,
  },
  invoiceLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A237E',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    width: '40%',
    fontWeight: 'medium',
  },
  metaValue: {
    width: '60%',
  },
  billToSection: {
    marginTop: 16,
    backgroundColor: '#F9F9F9',
    padding: 12,
    border: 1,
    borderColor: '#DDD',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'medium',
    color: '#1A1F71',
    marginBottom: 6,
  },
  clientName: {
    fontSize: 11,
    marginBottom: 4,
  },
  clientDetails: {
    fontSize: 9,
    marginBottom: 4,
    lineHeight: 1.4,
  },
  table: {
    marginTop: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5F6FA',
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#DDD',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 'medium',
    color: '#1A237E',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
    borderBottomWidth: 1,
    borderColor: '#EEE',
    minHeight: 24,
  },
  tableRowEven: {
    backgroundColor: '#FCFCFC',
  },
  tableCell: {
    fontSize: 9,
    paddingVertical: 2,
  },
  descriptionCell: {
    width: '50%',
    paddingRight: 8,
  },
  quantityCell: {
    width: '15%',
    textAlign: 'right',
  },
  priceCell: {
    width: '17.5%',
    textAlign: 'right',
  },
  totalCell: {
    width: '17.5%',
    textAlign: 'right',
  },
  infoWrapper: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 16,
    wrap: false,
  },
  paymentSection: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    border: 1,
    borderColor: '#DDD',
    padding: 12,
  },
  paymentTitle: {
    fontSize: 11,
    fontWeight: 'medium',
    color: '#1A1F71',
    marginBottom: 6,
  },
  paymentDetails: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  summarySection: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    border: 1,
    borderColor: '#DDD',
    padding: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderColor: '#1A237E',
    marginVertical: 6,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1A237E',
  },
  footer: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 9,
    fontStyle: 'italic',
    color: '#1A237E',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  paymentInfo?: PaymentInfo;
}

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, paymentInfo }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>Invoice from Marketlube</Text>
            <View style={styles.companyDetails}>
              <Text>1414, Phase 1, Hilite Business Park,</Text>
              <Text>Calicut, Kerala 673014</Text>
              <Text>Phone: +91 9061663675</Text>
              <Text>Email: hello@marketlube.in</Text>
              <Text>Website: www.marketlube.in</Text>
              <Text>GSTIN: 32ABFFP2844M1Z2</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.invoiceLabel}>Invoice Details</Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Invoice #:</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Date:</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.date)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Due Date:</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Type:</Text>
              <Text style={styles.metaValue}>{invoice.paymentType}</Text>
            </View>
          </View>
        </View>

        <View style={styles.billToSection}>
          <Text style={styles.sectionTitle}>Bill To:</Text>
          <Text style={styles.clientName}>{invoice.client.name}</Text>
          <Text style={styles.clientDetails}>{invoice.client.address}</Text>
          {invoice.client.gstin && (
            <Text style={styles.clientDetails}>GSTIN: {invoice.client.gstin}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionCell]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.quantityCell]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.priceCell]}>Unit Price</Text>
            <Text style={[styles.tableHeaderCell, styles.totalCell]}>Total</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={item.id} style={[
              styles.tableRow,
              index % 2 === 1 && styles.tableRowEven
            ]}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.priceCell]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.totalCell]}>
                {formatCurrency(calculateItemTotal(item))}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.infoWrapper}>
          {paymentInfo && (
            <View style={styles.paymentSection}>
              <Text style={styles.paymentTitle}>Payment Information:</Text>
              <Text style={styles.paymentDetails}>Account Name: {paymentInfo.accountName}</Text>
              <Text style={styles.paymentDetails}>A/C No: {paymentInfo.accountNumber}</Text>
              <Text style={styles.paymentDetails}>IFSC: {paymentInfo.ifsc}</Text>
            </View>
          )}

          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text>Subtotal:</Text>
              <Text>{formatCurrency(invoice.subtotal)}</Text>
            </View>

            {invoice.discountAmount > 0 && (
              <View style={styles.summaryRow}>
                <Text>Discount:</Text>
                <Text>-{formatCurrency(invoice.discountAmount)}</Text>
              </View>
            )}

            {invoice.taxAmount > 0 && (
              <>
                {invoice.taxMode === 'IGST' ? (
                  <View style={styles.summaryRow}>
                    <Text>IGST ({invoice.taxRate}%):</Text>
                    <Text>{formatCurrency(invoice.taxAmount)}</Text>
                  </View>
                ) : invoice.taxMode === 'CGST-SGST' ? (
                  <>
                    <View style={styles.summaryRow}>
                      <Text>CGST ({invoice.taxRate / 2}%):</Text>
                      <Text>{formatCurrency(invoice.taxAmount / 2)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text>SGST ({invoice.taxRate / 2}%):</Text>
                      <Text>{formatCurrency(invoice.taxAmount / 2)}</Text>
                    </View>
                  </>
                ) : null}
              </>
            )}

            <View style={styles.summaryDivider} />

            <View style={styles.grandTotal}>
              <Text>Grand Total:</Text>
              <Text>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Looking forward to doing business with you again.
        </Text>
      </View>
    </Page>
  </Document>
);

export default InvoicePDF;