"use client"

import { useState } from "react"
import { useCurrentAccount } from "@iota/dapp-kit"
import { useContract } from "@/hooks/useContract"
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Select,
  Separator,
  Text,
  TextArea,
  TextField,
  Card,
  Strong,
  Code,
} from "@radix-ui/themes"
import ClipLoader from "react-spinners/ClipLoader"

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================
type BadgeColor =
  | "gray"
  | "blue"
  | "orange"
  | "cyan"
  | "red"
  | "green"
  | "teal"
  | "yellow"
  | "amber"

const EVENT_TYPE_CONFIG: Record<number, { label: string; color: BadgeColor; icon: string }> = {
  0: { label: "Created", color: "gray", icon: "🎯" },
  1: { label: "Maintenance (+5)", color: "blue", icon: "🔧" },
  2: { label: "Damage (-3)", color: "orange", icon: "⚠️" },
  3: { label: "Inspection (+2)", color: "cyan", icon: "🔍" },
  4: { label: "Reported Lost (-50)", color: "red", icon: "🚨" },
  5: { label: "Verification (+10)", color: "green", icon: "✅" },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getTrustScoreColor = (score: number): string => {
  if (score >= 75) return "var(--green-11)"
  if (score >= 40) return "var(--yellow-11)"
  return "var(--red-11)"
}

const getTrustScoreGrade = (score: number): { label: string; color: BadgeColor } => {
  if (score >= 90) return { label: "Excellent", color: "green" }
  if (score >= 75) return { label: "Good", color: "teal" }
  if (score >= 50) return { label: "Fair", color: "yellow" }
  if (score >= 25) return { label: "Poor", color: "orange" }
  return { label: "Critical", color: "red" }
}

const getAssetStatus = (data: ReturnType<typeof useContract>["data"]) => {
  if (!data) return { label: "Unknown", color: "gray" as BadgeColor }

  const lastEvent = data.logs[data.logs.length - 1]
  if (lastEvent?.event_type === 4) return { label: "Lost", color: "red" as BadgeColor }

  if (data.trust_score >= 75) return { label: "Active", color: "green" as BadgeColor }
  if (data.trust_score >= 40) return { label: "Needs Attention", color: "amber" as BadgeColor }
  return { label: "At Risk", color: "red" as BadgeColor }
}

const shortenAddress = (address: string, chars = 6): string => {
  if (address.length <= chars * 2) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SampleIntegration = () => {
  const currentAccount = useCurrentAccount()
  const { data, actions, state, objectId, isOwner, objectExists, hasValidData } = useContract()

  // Form states
  const [metadata, setMetadata] = useState("")
  const [eventType, setEventType] = useState("1")
  const [eventDesc, setEventDesc] = useState("")
  const [recipient, setRecipient] = useState("")
  const [showTransferConfirm, setShowTransferConfirm] = useState(false)

  const isConnected = !!currentAccount
  const status = getAssetStatus(data)
  const grade = data ? getTrustScoreGrade(data.trust_score) : null

  // ============================================================================
  // RENDER: NOT CONNECTED STATE
  // ============================================================================

  if (!isConnected) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ minHeight: "100vh", padding: "2rem", background: "var(--gray-a2)" }}
      >
        <Card style={{ maxWidth: "480px", width: "100%" }}>
          <Flex direction="column" gap="3">
            <Box>
              <Heading size="6" style={{ marginBottom: "0.5rem" }}>
                🧬 Digital Twin Manager
              </Heading>
              <Text size="2" style={{ color: "var(--gray-a11)" }}>
                Connect your IOTA wallet to create and manage digital twins for your assets.
              </Text>
            </Box>
            <Separator size="4" />
            <Text size="2" style={{ color: "var(--gray-a11)" }}>
              <Strong>What you can do:</Strong>
              <br />
              • Mint digital twins with custom metadata
              <br />
              • Track trust scores and lifecycle events
              <br />
              • Transfer ownership securely on-chain
              <br />
              • Report lost or stolen assets
            </Text>
          </Flex>
        </Card>
      </Flex>
    )
  }

  // ============================================================================
  // RENDER: MAIN UI
  // ============================================================================

  return (
    <Box style={{ minHeight: "100vh", padding: "1.5rem", background: "var(--gray-a2)" }}>
      <Container size="4">
        {/* HEADER */}
        <Flex direction="column" gap="2" style={{ marginBottom: "2rem" }}>
          <Flex justify="between" align="start" gap="4" wrap="wrap">
            <Box>
              <Heading size="7" style={{ marginBottom: "0.5rem" }}>
                🧬 Digital Twin Manager
              </Heading>
              <Text size="3" style={{ color: "var(--gray-a11)" }}>
                Manage asset lifecycle on IOTA blockchain
              </Text>
            </Box>
            
            {objectId && (
              <Card style={{ padding: "0.75rem 1rem" }}>
                <Text size="1" style={{ color: "var(--gray-a11)", display: "block", marginBottom: "0.25rem" }}>
                  Current Twin ID
                </Text>
                <Code size="1">{shortenAddress(objectId, 8)}</Code>
              </Card>
            )}
          </Flex>
        </Flex>

        {/* ================================================================ */}
        {/* NO DIGITAL TWIN YET - MINT NEW */}
        {/* ================================================================ */}
        {!objectId && (
          <Card size="3">
            <Flex direction="column" gap="4">
              <Box>
                <Heading size="5" style={{ marginBottom: "0.75rem" }}>
                  🪪 Mint Your First Digital Twin
                </Heading>
                <Text size="2" style={{ color: "var(--gray-a11)" }}>
                  Create an on-chain representation of your asset. Include details like serial number,
                  model, purchase date, or any identifying information.
                </Text>
              </Box>

              <Box>
                <Text as="label" size="2" weight="bold" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Asset Metadata
                </Text>
                <TextArea
                  value={metadata}
                  onChange={(e) => setMetadata(e.target.value)}
                  placeholder="Example: Dell XPS 15 Laptop - Serial: ABC123XYZ - Owner: John Doe - Purchased: 2024-01-15"
                  rows={4}
                  style={{ fontFamily: "var(--font-mono)" }}
                />
                <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.5rem", display: "block" }}>
                  💡 Tip: Include serial numbers, model info, and purchase details for better tracking
                </Text>
              </Box>

              <Flex gap="3" align="center" wrap="wrap">
                <Button
                  size="3"
                  onClick={() => actions.mintToSender(metadata)}
                  disabled={!metadata.trim() || state.isPending}
                >
                  {state.isPending ? (
                    <>
                      <ClipLoader size={16} color="currentColor" />
                      Minting...
                    </>
                  ) : (
                    <>🎯 Mint Digital Twin</>
                  )}
                </Button>

                <Flex direction="column" gap="1">
                  <Text size="2" style={{ color: "var(--gray-a11)" }}>
                    Initial trust score: <Strong>50/100</Strong>
                  </Text>
                  <Text size="1" style={{ color: "var(--gray-a11)" }}>
                    (Neutral starting point)
                  </Text>
                </Flex>
              </Flex>

              {state.error && (
                <Card style={{ background: "var(--red-a3)", padding: "1rem" }}>
                  <Text style={{ color: "var(--red-11)" }}>
                    <Strong>Error:</Strong> {state.error.message}
                  </Text>
                </Card>
              )}
            </Flex>
          </Card>
        )}

        {/* ================================================================ */}
        {/* HAS DIGITAL TWIN - SHOW DETAILS */}
        {/* ================================================================ */}
        {objectId && (
          <>
            {/* Loading State */}
            {state.isLoading && !data ? (
              <Flex justify="center" align="center" style={{ padding: "4rem" }}>
                <Flex direction="column" align="center" gap="3">
                  <ClipLoader size={40} />
                  <Text size="2" style={{ color: "var(--gray-a11)" }}>
                    Loading twin data...
                  </Text>
                </Flex>
              </Flex>

            ) : state.error && !objectExists ? (
              /* Error State - Object Not Found */
              <Card style={{ background: "var(--red-a3)" }}>
                <Flex direction="column" gap="3">
                  <Heading size="4">⚠️ Error Loading Twin</Heading>
                  <Text size="2" style={{ color: "var(--red-11)" }}>
                    {state.error.message || "Object not found or invalid"}
                  </Text>
                  <Text size="1" style={{ color: "var(--gray-a11)" }}>
                    Object ID: <Code>{objectId}</Code>
                  </Text>
                  <Button size="2" variant="soft" onClick={actions.clearObject}>
                    Clear & Mint New Twin
                  </Button>
                </Flex>
              </Card>

            ) : objectExists && !hasValidData ? (
              /* Error State - Invalid Data Structure */
              <Card style={{ background: "var(--yellow-a3)" }}>
                <Flex direction="column" gap="2">
                  <Heading size="4">🧐 Invalid Data Structure</Heading>
                  <Text size="2" style={{ color: "var(--yellow-11)" }}>
                    Object exists but doesn&apos;t match expected DigitalTwin structure.
                  </Text>
                  <Button size="2" variant="soft" onClick={actions.clearObject}>
                    Clear & Mint New Twin
                  </Button>
                </Flex>
              </Card>

            ) : data ? (
              /* Main Content - Twin Details */
              <Box
                style={{
                  display: "grid",
                  gap: "1.5rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
                }}
              >
                {/* ========================================================== */}
                {/* LEFT COLUMN: TWIN INFO */}
                {/* ========================================================== */}
                <Flex direction="column" gap="4">
                  {/* Twin Overview Card */}
                  <Card size="3">
                    <Flex direction="column" gap="4">
                      <Flex justify="between" align="start" wrap="wrap" gap="2">
                        <Heading size="5">📦 Asset Overview</Heading>
                        <Badge size="2" color={status.color} radius="full">
                          {status.label}
                        </Badge>
                      </Flex>

                      <Separator size="4" />

                      {/* Metadata */}
                      <Box>
                        <Text size="1" weight="bold" style={{ color: "var(--gray-a11)", display: "block", marginBottom: "0.5rem" }}>
                          METADATA
                        </Text>
                        <Text size="2" style={{ fontFamily: "var(--font-mono)", wordBreak: "break-word" }}>
                          {data.metadata || "—"}
                        </Text>
                      </Box>

                      {/* Trust Score */}
                      <Box>
                        <Text size="1" weight="bold" style={{ color: "var(--gray-a11)", display: "block", marginBottom: "0.5rem" }}>
                          TRUST SCORE
                        </Text>
                        <Flex align="center" gap="3" wrap="wrap">
                          <Heading size="6" style={{ color: getTrustScoreColor(data.trust_score) }}>
                            {data.trust_score}
                            <Text size="4" style={{ color: "var(--gray-a11)" }}>/100</Text>
                          </Heading>
                          {grade && (
                            <Badge size="2" color={grade.color} variant="soft">
                              {grade.label}
                            </Badge>
                          )}
                        </Flex>
                        <Box
                          style={{
                            marginTop: "0.75rem",
                            height: "8px",
                            borderRadius: "999px",
                            background: "var(--gray-a5)",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            style={{
                              height: "100%",
                              width: `${Math.min(data.trust_score, 100)}%`,
                              background: getTrustScoreColor(data.trust_score),
                              transition: "width 0.3s ease",
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Owner */}
                      <Box>
                        <Flex align="center" gap="2" style={{ marginBottom: "0.5rem" }}>
                          <Text size="1" weight="bold" style={{ color: "var(--gray-a11)" }}>
                            OWNER
                          </Text>
                          {isOwner && <Badge size="1" color="green">You</Badge>}
                        </Flex>
                        <Code size="1" style={{ wordBreak: "break-all" }}>{data.owner}</Code>
                      </Box>

                      <Separator size="2" />

                      <Text size="1" style={{ color: "var(--gray-a11)" }}>
                        Object ID: <Code>{shortenAddress(objectId, 8)}</Code>
                      </Text>
                    </Flex>
                  </Card>

                  {/* Event Logs Card */}
                  <Card size="3">
                    <Flex direction="column" gap="3">
                      <Flex justify="between" align="center">
                        <Heading size="4">📜 Event History</Heading>
                        <Badge size="1" variant="soft">
                          {data.logs.length} {data.logs.length === 1 ? "event" : "events"}
                        </Badge>
                      </Flex>

                      <Separator size="4" />

                      {data.logs.length === 0 ? (
                        <Text size="2" style={{ color: "var(--gray-a11)", textAlign: "center", padding: "2rem 0" }}>
                          No events recorded yet. Add your first event using the panel on the right.
                        </Text>
                      ) : (
                        <Flex direction="column" gap="2">
                          {[...data.logs].reverse().map((log, idx) => {
                            const config = EVENT_TYPE_CONFIG[log.event_type] || EVENT_TYPE_CONFIG[0]
                            const actualIndex = data.logs.length - idx

                            return (
                              <Box key={idx}>
                                {idx > 0 && <Separator size="2" style={{ margin: "0.5rem 0", opacity: 0.3 }} />}
                                <Flex justify="between" align="start" gap="3">
                                  <Flex direction="column" gap="1" style={{ flex: 1 }}>
                                    <Flex align="center" gap="2">
                                      <Text size="2">{config.icon}</Text>
                                      <Text size="2" weight="medium">
                                        {log.description || "(no description)"}
                                      </Text>
                                    </Flex>
                                    <Text size="1" style={{ color: "var(--gray-a11)" }}>
                                      {config.label}
                                    </Text>
                                  </Flex>
                                  <Badge size="1" variant="soft" color={config.color}>
                                    #{actualIndex}
                                  </Badge>
                                </Flex>
                              </Box>
                            )
                          })}
                        </Flex>
                      )}
                    </Flex>
                  </Card>
                </Flex>

                {/* ========================================================== */}
                {/* RIGHT COLUMN: ACTIONS */}
                {/* ========================================================== */}
                <Flex direction="column" gap="4">
                  {/* Add Event Card */}
                  <Card size="3">
                    <Flex direction="column" gap="3">
                      <Heading size="4">✏️ Add Lifecycle Event</Heading>
                      <Separator size="4" />

                      <Box>
                        <Text as="label" size="2" weight="bold" style={{ display: "block", marginBottom: "0.5rem" }}>
                          Event Type
                        </Text>
                        <Select.Root value={eventType} onValueChange={setEventType}>
                          <Select.Trigger />
                          <Select.Content>
                            {Object.entries(EVENT_TYPE_CONFIG)
                              .filter(([key]) => key !== "0" && key !== "4") // Exclude Created and Lost
                              .map(([value, config]) => (
                                <Select.Item key={value} value={value}>
                                  {config.icon} {config.label}
                                </Select.Item>
                              ))}
                          </Select.Content>
                        </Select.Root>
                      </Box>

                      <Box>
                        <Text as="label" size="2" weight="bold" style={{ display: "block", marginBottom: "0.5rem" }}>
                          Description
                        </Text>
                        <TextArea
                          value={eventDesc}
                          onChange={(e) => setEventDesc(e.target.value)}
                          placeholder="Describe what happened... (e.g., 'Routine maintenance completed', 'Minor scratch on back panel')"
                          rows={3}
                        />
                      </Box>

                      <Button
                        size="3"
                        onClick={() => {
                          actions.addEvent(parseInt(eventType, 10), eventDesc)
                          setEventDesc("")
                        }}
                        disabled={!eventDesc.trim() || state.isPending}
                      >
                        {state.isPending ? (
                          <>
                            <ClipLoader size={16} color="currentColor" />
                            Adding...
                          </>
                        ) : (
                          "Add Event"
                        )}
                      </Button>
                    </Flex>
                  </Card>

                  {/* Report Lost Card */}
                  <Card size="3" style={{ background: "var(--red-a2)" }}>
                    <Flex direction="column" gap="3">
                      <Heading size="4">🚨 Report Asset Lost</Heading>
                      <Text size="2" style={{ color: "var(--gray-a11)" }}>
                        Mark this asset as lost or stolen. This will add a &quot;Reported lost&quot; event 
                        and severely reduce the trust score by 50 points.
                      </Text>
                      <Text size="1" style={{ color: "var(--red-11)" }}>
                        ⚠️ Warning: This action cannot be undone and will significantly impact the trust score.
                      </Text>
                      <Button
                        size="3"
                        color="red"
                        variant="soft"
                        onClick={actions.reportLost}
                        disabled={state.isPending}
                      >
                        {state.isPending ? (
                          <>
                            <ClipLoader size={16} color="currentColor" />
                            Reporting...
                          </>
                        ) : (
                          "Report Lost"
                        )}
                      </Button>
                    </Flex>
                  </Card>

                  {/* Transfer Twin Card (Owner Only) */}
                  {isOwner && (
                    <Card size="3">
                      <Flex direction="column" gap="3">
                        <Heading size="4">🔄 Transfer Ownership</Heading>
                        <Text size="2" style={{ color: "var(--gray-a11)" }}>
                          Transfer this digital twin to another wallet address. The recipient will become 
                          the new owner and gain full control.
                        </Text>

                        {!showTransferConfirm ? (
                          <Button 
                            size="3" 
                            variant="soft" 
                            onClick={() => setShowTransferConfirm(true)}
                          >
                            Initiate Transfer
                          </Button>
                        ) : (
                          <>
                            <Box>
                              <Text as="label" size="2" weight="bold" style={{ display: "block", marginBottom: "0.5rem" }}>
                                Recipient Address
                              </Text>
                              <TextField.Root
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="0x..."
                                style={{ fontFamily: "var(--font-mono)" }}
                              />
                              <Text size="1" style={{ color: "var(--gray-a11)", marginTop: "0.5rem", display: "block" }}>
                                💡 Double-check the address - transfers cannot be reversed
                              </Text>
                            </Box>
                            <Flex gap="2">
                              <Button
                                size="3"
                                onClick={() => {
                                  actions.transferTwin(recipient)
                                  setRecipient("")
                                  setShowTransferConfirm(false)
                                }}
                                disabled={!recipient.trim() || state.isPending}
                              >
                                {state.isPending ? (
                                  <>
                                    <ClipLoader size={16} color="currentColor" />
                                    Transferring...
                                  </>
                                ) : (
                                  "Confirm Transfer"
                                )}
                              </Button>
                              <Button
                                size="3"
                                variant="soft"
                                color="gray"
                                onClick={() => {
                                  setShowTransferConfirm(false)
                                  setRecipient("")
                                }}
                                disabled={state.isPending}
                              >
                                Cancel
                              </Button>
                            </Flex>
                          </>
                        )}
                      </Flex>
                    </Card>
                  )}

                  {/* Transaction Status Card */}
                  {(state.hash || state.error) && (
                    <Card 
                      size="2" 
                      style={{ 
                        background: state.error ? "var(--red-a3)" : "var(--gray-a3)",
                        border: state.error ? "1px solid var(--red-a6)" : "1px solid var(--gray-a6)"
                      }}
                    >
                      <Flex direction="column" gap="2">
                        {state.hash && (
                          <Box>
                            <Text size="1" weight="bold" style={{ color: "var(--gray-a11)", display: "block", marginBottom: "0.5rem" }}>
                              Transaction Hash
                            </Text>
                            <Code size="1" style={{ wordBreak: "break-all" }}>
                              {shortenAddress(state.hash, 10)}
                            </Code>
                            {state.isConfirmed && (
                              <Flex align="center" gap="2" style={{ marginTop: "0.75rem" }}>
                                <Text size="2" style={{ color: "var(--green-11)" }}>
                                  ✅ Transaction confirmed
                                </Text>
                              </Flex>
                            )}
                          </Box>
                        )}

                        {state.error && (
                          <Box 
                            style={{
                              marginTop: state.hash ? "0.75rem" : 0,
                              padding: "0.75rem",
                              borderRadius: "8px",
                              background: "var(--red-a4)",
                            }}
                          >
                            <Text size="2" style={{ color: "var(--red-11)" }}>
                              <Strong>Error:</Strong> {state.error.message}
                            </Text>
                          </Box>
                        )}
                      </Flex>
                    </Card>
                  )}
                </Flex>
              </Box>
            ) : null}
          </>
        )}
      </Container>
    </Box>
  )
}

export default SampleIntegration