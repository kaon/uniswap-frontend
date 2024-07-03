import * as Sentry from '@sentry/react'
import { ButtonLight, SmallButtonPrimary } from 'components/Button'
import { Column } from 'components/Column'
import { useIsMobile } from 'hooks/screenSize'
import { useAccount } from 'hooks/useAccount'
import { Trans } from 'i18n'
import { ChevronUpIcon } from 'nft/components/icons'
import { PropsWithChildren, useState } from 'react'
import { Copy } from 'react-feather'
import styled from 'styled-components'
import { CopyToClipboard, ExternalLink, ThemedText } from 'theme/components'
import { isRemoteReportingEnabled } from 'utils/env'

const FallbackWrapper = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
`

const BodyWrapper = styled.div<{ margin?: string }>`
  width: 100%;
  max-width: 500px;
  margin: auto;
  padding: 1rem;
`

const SmallButtonLight = styled(ButtonLight)`
  font-size: 16px;
  padding: 10px 16px;
  border-radius: 12px;
`

const StretchedRow = styled.div`
  display: flex;
  gap: 24px;

  > * {
    display: flex;
    flex: 1;
  }
`

const Code = styled.code`
  font-weight: 485;
  font-size: 12px;
  line-height: 16px;
  word-wrap: break-word;
  width: 100%;
  color: ${({ theme }) => theme.neutral1};
  font-family: ${({ theme }) => theme.fonts.code};
  overflow: scroll;
  max-height: calc(100vh - 450px);
`

const Separator = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.surface3};
`

const CodeBlockWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.surface2};
  box-shadow:
    0px 0px 1px rgba(0, 0, 0, 0.01),
    0px 4px 8px rgba(0, 0, 0, 0.04),
    0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 24px;
  padding: 24px;
  gap: 10px;
  color: ${({ theme }) => theme.neutral1};
`

const ShowMoreButton = styled.div`
  display: flex;
  cursor: pointer;
  justify-content: space-between;
`

const CopyIcon = styled(Copy)`
  stroke: ${({ theme }) => theme.neutral2};
`

const ShowMoreIcon = styled(ChevronUpIcon)<{ $isExpanded?: boolean }>`
  transform: ${({ $isExpanded }) => ($isExpanded ? 'none' : 'rotate(180deg)')};
`

const CodeTitle = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  word-break: break-word;
`

const Fallback = ({ error, eventId }: { error: Error; eventId: string | null }) => {
  const [isExpanded, setExpanded] = useState(false)
  const isMobile = useIsMobile()

  // @todo: ThemedText components should be responsive by default
  const [Title, Description] = isMobile
    ? [ThemedText.HeadlineSmall, ThemedText.BodySmall]
    : [ThemedText.HeadlineLarge, ThemedText.BodySecondary]

  const showErrorId = isRemoteReportingEnabled() && eventId

  const showMoreButton = (
    <ShowMoreButton onClick={() => setExpanded((s) => !s)}>
      <ThemedText.Link color="neutral2">
        {isExpanded ? <Trans i18nKey="common.showLess.button" /> : <Trans i18nKey="common.showMore.button" />}
      </ThemedText.Link>
      <ShowMoreIcon $isExpanded={isExpanded} secondaryWidth="20" secondaryHeight="20" />
    </ShowMoreButton>
  )

  const errorDetails = error.stack || error.message

  return (
    <FallbackWrapper>
      <BodyWrapper>
        <Column gap="xl">
          {showErrorId ? (
            <>
              <Column gap="sm">
                <Title textAlign="center">
                  <Trans i18nKey="common.somethingWentWrong.error" />
                </Title>
                <Description textAlign="center" color="neutral2">
                  <Trans i18nKey="error.request.provideId" />
                </Description>
              </Column>
              <CodeBlockWrapper>
                <CodeTitle>
                  <ThemedText.SubHeader>
                    <Trans i18nKey="error.id" values={{ eventId }} />
                  </ThemedText.SubHeader>
                  <CopyToClipboard toCopy={eventId}>
                    <CopyIcon />
                  </CopyToClipboard>
                </CodeTitle>
                <Separator />
                {isExpanded && (
                  <>
                    <Code>{errorDetails}</Code>
                    <Separator />
                  </>
                )}
                {showMoreButton}
              </CodeBlockWrapper>
            </>
          ) : (
            <>
              <Column gap="sm">
                <Title textAlign="center">
                  <Trans i18nKey="common.somethingWentWrong.error" />
                </Title>
                <Description textAlign="center" color="neutral2">
                  <Trans i18nKey="common.error.request" />
                </Description>
              </Column>
              <CodeBlockWrapper>
                <CodeTitle>
                  <ThemedText.SubHeader>Error details</ThemedText.SubHeader>
                  <CopyToClipboard toCopy={errorDetails}>
                    <CopyIcon />
                  </CopyToClipboard>
                </CodeTitle>
                <Separator />
                <Code>{errorDetails.split('\n').slice(0, isExpanded ? undefined : 4)}</Code>
                <Separator />
                {showMoreButton}
              </CodeBlockWrapper>
            </>
          )}
          <StretchedRow>
            <SmallButtonPrimary onClick={() => window.location.reload()}>
              <Trans i18nKey="common.reload.label" />
            </SmallButtonPrimary>
            <ExternalLink id="get-support-on-discord" href="https://discord.gg/FCfyBSbCU5" target="_blank">
              <SmallButtonLight>
                <Trans i18nKey="common.getSupport.button" />
              </SmallButtonLight>
            </ExternalLink>
          </StretchedRow>
        </Column>
      </BodyWrapper>
    </FallbackWrapper>
  )
}

export default function ErrorBoundary({ children }: PropsWithChildren): JSX.Element {
  const { chainId } = useAccount()
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, eventId }) => <Fallback error={error} eventId={eventId} />}
      beforeCapture={(scope) => {
        scope.setLevel('fatal')
        scope.setTag('chain_id', chainId)
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
