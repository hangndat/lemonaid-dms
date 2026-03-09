import { PageContainer } from '@ant-design/pro-components'
import { Card, Typography, Row, Col, Alert, Space } from 'antd'
import {
  CarOutlined,
  UserAddOutlined,
  SwapOutlined,
  TeamOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { LEMONAIDE } from '../theme/lemonaide'

const { Paragraph } = Typography

const STEPS = [
  { key: 'step1Title', keyDesc: 'step1Desc', icon: CarOutlined, color: '#1890ff' },
  { key: 'step2Title', keyDesc: 'step2Desc', icon: UserAddOutlined, color: '#52c41a' },
  { key: 'step3Title', keyDesc: 'step3Desc', icon: SwapOutlined, color: LEMONAIDE.colorPrimary },
  { key: 'step4Title', keyDesc: 'step4Desc', icon: TeamOutlined, color: '#722ed1' },
  { key: 'step5Title', keyDesc: 'step5Desc', icon: BarChartOutlined, color: '#13c2c2' },
] as const

export function SystemProcessPage() {
  const { t } = useTranslation('process')

  return (
    <div className="system-process-page">
      <PageContainer title={t('title')} subTitle={t('subTitle')}>
        <Card
          bordered={false}
          style={{
            marginBottom: 28,
            borderRadius: 12,
            background: `linear-gradient(135deg, rgba(232, 185, 35, 0.1) 0%, rgba(45, 106, 79, 0.06) 100%)`,
            borderLeft: `4px solid ${LEMONAIDE.colorSecondary}`,
          }}
        >
          <Paragraph
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              marginBottom: 0,
              color: 'rgba(0,0,0,0.75)',
            }}
          >
            {t('overview')}
          </Paragraph>
        </Card>

        <Row gutter={[0, 16]}>
          {STEPS.map(({ key, keyDesc, icon: Icon, color }, index) => (
            <Col span={24} key={key}>
              <Card
                bordered
                size="small"
                style={{
                  borderRadius: 10,
                  borderLeft: `4px solid ${color}`,
                  transition: 'box-shadow 0.2s',
                }}
                styles={{ body: { padding: '18px 22px' } }}
              >
                <Space align="start" size={16} style={{ width: '100%' }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: `${color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontWeight: 700,
                      fontSize: 16,
                      color,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: 'rgba(0,0,0,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Icon style={{ fontSize: 18, color }} />
                      {t(key)}
                    </div>
                    <Paragraph
                      style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: 'rgba(0,0,0,0.65)',
                      }}
                    >
                      {t(keyDesc)}
                    </Paragraph>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message={t('notesTitle')}
          description={t('notesMock')}
          style={{
            marginTop: 28,
            borderRadius: 10,
            border: '1px solid #91d5ff',
          }}
        />
      </PageContainer>
    </div>
  )
}
