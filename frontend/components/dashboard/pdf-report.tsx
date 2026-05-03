// components/dashboard/pdf-report.tsx
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, backgroundColor: '#ffffff' },
  title: { fontSize: 20, marginBottom: 10, color: '#1e293b' },
  subtitle: { fontSize: 14, marginBottom: 20, color: '#64748b' },
  section: { marginBottom: 15 },
  sectionTitle: { fontSize: 14, marginBottom: 8, fontWeight: 'bold', color: '#334155' },
  row: { flexDirection: 'row', marginBottom: 5 },
  label: { width: 120, fontSize: 10, color: '#64748b' },
  value: { fontSize: 10, color: '#1e293b', fontWeight: 'bold' },
  table: { marginTop: 10 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 5 },
  tableHeader: { backgroundColor: '#f1f5f9', fontWeight: 'bold' },
  tableCell: { flex: 1, fontSize: 9, paddingHorizontal: 4 },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
})

export function PDFReport({ metricData }: { metricData: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Отчет по показателю: {metricData.title}</Text>
        <Text style={styles.subtitle}>Сгенерировано: {new Date().toLocaleString('ru-RU')}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основная информация</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Текущее значение:</Text>
            <Text style={styles.value}>{metricData.currentValue}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Целевой диапазон:</Text>
            <Text style={styles.value}>{metricData.targetRange}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Статус:</Text>
            <Text style={styles.value}>{metricData.status === 'critical' ? 'Критично' : metricData.status === 'warning' ? 'Внимание' : 'Норма'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Динамика за 7 дней</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>День</Text>
              <Text style={styles.tableCell}>Значение</Text>
            </View>
            {metricData.chartData.map((item: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.day}</Text>
                <Text style={styles.tableCell}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Проблемные локации</Text>
          {metricData.problemLocations.map((loc: any, i: number) => (
            <View key={i} style={styles.row}>
              <Text style={styles.label}>{loc.name}:</Text>
              <Text style={styles.value}>{loc.value}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>АгроКонтроль — Ситуационный центр</Text>
      </Page>
    </Document>
  )
}