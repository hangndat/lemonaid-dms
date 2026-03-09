import { PageContainer } from '@ant-design/pro-components'
import { Card, Typography, Row, Col, Space } from 'antd'
import {
  CarOutlined,
  UserAddOutlined,
  SwapOutlined,
  TeamOutlined,
  CodeOutlined,
  MailOutlined,
} from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { LEMONAIDE } from '../theme/lemonaide'

const { Title, Paragraph } = Typography

const FEATURES = [
  { key: 'featureInventory', icon: CarOutlined, color: '#1890ff' },
  { key: 'featureLeads', icon: UserAddOutlined, color: '#52c41a' },
  { key: 'featureDeals', icon: SwapOutlined, color: LEMONAIDE.colorPrimary },
  { key: 'featureCustomers', icon: TeamOutlined, color: '#722ed1' },
] as const

export function AboutPage() {
  const { t } = useTranslation('about')

  return (
    <div className="about-page">
      <PageContainer title={t('title')} subTitle={t('subTitle')}>
        {/* Hero intro */}
        <Card
          bordered={false}
          className="about-hero"
          style={{
            marginBottom: 28,
            borderRadius: 12,
            background: `linear-gradient(135deg, rgba(232, 185, 35, 0.12) 0%, rgba(45, 106, 79, 0.08) 100%)`,
            borderLeft: `4px solid ${LEMONAIDE.colorPrimary}`,
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
            {t('intro')}
          </Paragraph>
        </Card>

        <Title level={5} style={{ marginBottom: 16, fontWeight: 600, color: 'rgba(0,0,0,0.85)' }}>
          {t('featuresTitle')}
        </Title>
        <Row gutter={[16, 16]} style={{ marginBottom: 28 }}>
          {FEATURES.map(({ key, icon: Icon, color }) => (
            <Col xs={24} sm={12} lg={6} key={key}>
              <Card
                size="small"
                bordered
                hoverable
                className="about-feature-card"
                style={{
                  borderRadius: 10,
                  height: '100%',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                }}
                styles={{
                  body: { padding: '16px 18px' },
                }}
              >
                <Space size={14} align="start">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: `${color}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon style={{ fontSize: 22, color }} />
                  </div>
                  <Paragraph
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.5,
                      color: 'rgba(0,0,0,0.75)',
                    }}
                  >
                    {t(key)}
                  </Paragraph>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[20, 20]}>
          <Col xs={24} lg={12}>
            <Card
              bordered
              className="about-info-card"
              style={{
                borderRadius: 10,
                height: '100%',
                borderTop: `3px solid ${LEMONAIDE.colorPrimary}`,
              }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <Space align="start" size={16}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${LEMONAIDE.colorPrimary}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <CodeOutlined style={{ fontSize: 24, color: LEMONAIDE.colorPrimary }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={5} style={{ marginTop: 0, marginBottom: 10, fontWeight: 600 }}>
                    {t('techTitle')}
                  </Title>
                  <Paragraph style={{ marginBottom: 0, color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                    {t('techDesc')}
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              bordered
              className="about-info-card"
              style={{
                borderRadius: 10,
                height: '100%',
                borderTop: `3px solid ${LEMONAIDE.colorSecondary}`,
              }}
              styles={{ body: { padding: '20px 24px' } }}
            >
              <Space align="start" size={16}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${LEMONAIDE.colorSecondary}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MailOutlined style={{ fontSize: 24, color: LEMONAIDE.colorSecondary }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={5} style={{ marginTop: 0, marginBottom: 10, fontWeight: 600 }}>
                    {t('contactTitle')}
                  </Title>
                  <Paragraph style={{ marginBottom: 0, color: 'rgba(0,0,0,0.7)', lineHeight: 1.6 }}>
                    {t('contactDesc')}
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </div>
  )
}
