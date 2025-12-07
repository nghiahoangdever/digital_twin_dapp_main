"use client"

import { useState, useEffect, useCallback } from "react"
import {
  useCurrentAccount,
  useIotaClient,
  useSignAndExecuteTransaction,
  useIotaClientQuery,
} from "@iota/dapp-kit"
import { Transaction } from "@iota/iota-sdk/transactions"
import { IotaClient, type IotaObjectData } from "@iota/iota-sdk/client"

// ============================================================================
// CONTRACT CONFIGURATION
// ============================================================================

export const PACKAGE_ID =
  "0x703c97fb88edc981081307351be009b7815b1f5ae2e31421e9ef9d84bf2b0856"
export const CONTRACT_MODULE = "contract"
export const CONTRACT_METHODS = {
  GET_TRUST_SCORE: "get_trust_score",
  GET_OWNER: "get_owner",
  MINT_TO_SENDER: "mint_to_sender",
  ADD_EVENT: "add_event",
  REPORT_LOST: "report_lost",
  TRANSFER_TWIN: "transfer_twin",
} as const

// ============================================================================
// TYPES
// ============================================================================

export interface LifecycleEvent {
  event_type: number
  description: string
}

export interface ContractData {
  owner: string
  metadata: string
  trust_score: number
  logs: LifecycleEvent[]
}

export interface ContractState {
  isLoading: boolean
  isPending: boolean
  isConfirming: boolean
  isConfirmed: boolean
  hash: string | undefined
  error: Error | null
}

export interface ContractActions {
  mintToSender: (metadata: string) => Promise<void>
  addEvent: (eventType: number, description: string) => Promise<void>
  reportLost: () => Promise<void>
  transferTwin: (recipient: string) => Promise<void>
  clearObject: () => void
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Decode vector<u8> from various possible formats:
 * - number[] array
 * - "0x..." hex string
 * - { bytes: "0x..." } object
 * - plain string
 */
function decodeBytesField(value: unknown): string {
  console.log("🔍 decodeBytesField input:", value, "| Type:", typeof value)
  
  if (value == null) {
    console.log("❌ Value is null/undefined")
    return ""
  }

  // Plain string (non-hex)
  if (typeof value === "string" && !value.startsWith("0x")) {
    console.log("✅ Plain string:", value)
    return value
  }

  // Hex string "0x..."
  if (typeof value === "string" && value.startsWith("0x")) {
    const hex = value.slice(2)
    console.log("🔍 Hex string, length:", hex.length)
    const bytes: number[] = []
    for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.slice(i, i + 2), 16)
      if (!Number.isNaN(byte)) bytes.push(byte)
    }
    const decoded = new TextDecoder().decode(new Uint8Array(bytes))
    console.log("✅ Decoded from hex:", decoded)
    return decoded
  }

  // Array of numbers
  if (Array.isArray(value)) {
    console.log("🔍 Array of bytes, length:", value.length, "| First 5:", value.slice(0, 5))
    const decoded = new TextDecoder().decode(new Uint8Array(value as number[]))
    console.log("✅ Decoded from array:", decoded)
    return decoded
  }

  // Object with .bytes property
  if (typeof value === "object") {
    const obj = value as { bytes?: unknown }
    console.log("🔍 Object detected, has .bytes?", !!obj.bytes)
    if (typeof obj.bytes === "string") {
      const hex = obj.bytes.startsWith("0x") ? obj.bytes.slice(2) : obj.bytes
      const bytes: number[] = []
      for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.slice(i, i + 2), 16)
        if (!Number.isNaN(byte)) bytes.push(byte)
      }
      const decoded = new TextDecoder().decode(new Uint8Array(bytes))
      console.log("✅ Decoded from object.bytes:", decoded)
      return decoded
    }
  }

  console.log("❌ Could not decode, returning empty string")
  return ""
}

/**
 * Extract DigitalTwin fields from IOTA object data
 */
function extractDigitalTwinFields(data: IotaObjectData): ContractData | null {
  console.log("🔍 Extracting fields from object data:", data)
  /*const object_id = data.objectId || "unknown"
  const client = new IotaClient()

  const field = obj*/

  if (data.content?.dataType !== "moveObject") {
    console.log("❌ Data is not a moveObject:", data.content?.dataType)
    return null
  }

  const fields = data.content.fields as Record<string, unknown>
  if (!fields) {
    console.log("❌ No fields found in object data")
    return null
  }

  console.log("📦 Object fields:", JSON.stringify(fields, null, 2))

  // Extract owner
  if (!fields.owner) {
    console.log("❌ Owner field is missing")
    return null
  }
  const owner = String(fields.owner)

  // Extract trust_score
  let trust_score: number
  if (typeof fields.trust_score === "string") {
    trust_score = parseInt(fields.trust_score, 10)
    if (isNaN(trust_score)) {
      console.log("❌ Trust score is not a valid number:", fields.trust_score)
      return null
    }
  } else if (typeof fields.trust_score === "number") {
    trust_score = fields.trust_score
  } else {
    console.log("❌ Trust score invalid type:", typeof fields.trust_score)
    return null
  }

  // Extract metadata
  const metadata = decodeBytesField(fields.metadata)

  // Extract logs
  const rawLogs = fields.logs
  const logs: LifecycleEvent[] = Array.isArray(rawLogs)
    ? (rawLogs as Record<string, unknown>[]).map((log) => {

      console.log("🔍 Processing log entry:", log)
        const rawEventType = log.event_type
        let event_type = 0

        if (typeof rawEventType === "string") {
          const parsed = parseInt(rawEventType, 10)
          event_type = Number.isNaN(parsed) ? 0 : parsed
        } else if (typeof rawEventType === "number") {
          event_type = rawEventType
        }

        console.log("description field:", log.fields.description)
        const description = decodeBytesField(log.fields.description)

        return { event_type, description }
      })
    : []

  return {
    owner,
    metadata,
    trust_score,
    logs,
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useContract = () => {
  const currentAccount = useCurrentAccount()
  const address = currentAccount?.address
  const iotaClient = useIotaClient()
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction()

  const [objectId, setObjectId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hash, setHash] = useState<string | undefined>()
  const [transactionError, setTransactionError] = useState<Error | null>(null)

  // Load objectId from URL hash on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlHash = window.location.hash.slice(1)
      if (urlHash) {
        setObjectId(urlHash)
      }
    }
  }, [])

  // Fetch object data from blockchain
  const {
    data,
    isPending: isFetching,
    error: queryError,
    refetch,
  } = useIotaClientQuery(
    "getObject",
    {
      id: objectId!,
      options: { showContent: true, showOwner: true },
    },
    {
      enabled: !!objectId,
      refetchInterval: false,
    }
  )

  // Extract and parse data
  const fields = data?.data ? extractDigitalTwinFields(data.data) : null

  console.log("🏷️ Contract fields:", fields)
  
  const isOwner = fields?.owner.toLowerCase() === address?.toLowerCase()
  const objectExists = !!data?.data
  const hasValidData = !!fields

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Mint a new Digital Twin NFT
   */
  const mintToSender = useCallback(
    async (metadata: string) => {
      if (!metadata.trim()) {
        setTransactionError(new Error("Metadata cannot be empty"))
        return
      }

      try {
        setIsLoading(true)
        setTransactionError(null)
        setHash(undefined)

        const tx = new Transaction()
        const metadataBytes = new TextEncoder().encode(metadata)

        tx.moveCall({
          arguments: [tx.pure.vector("u8", Array.from(metadataBytes))],
          target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.MINT_TO_SENDER}`,
        })

        signAndExecute(
          { transaction: tx.serialize() },
          {
            onSuccess: async ({ digest }) => {
              setHash(digest)
              try {
                const { effects } = await iotaClient.waitForTransaction({
                  digest,
                  options: { showEffects: true },
                })

                const newObjectId = effects?.created?.[0]?.reference?.objectId
                if (newObjectId) {
                  setObjectId(newObjectId)
                  if (typeof window !== "undefined") {
                    window.location.hash = newObjectId
                  }
                  console.log("✅ Digital Twin minted:", newObjectId)
                } else {
                  console.warn("⚠️ No object ID found in transaction effects")
                }
              } catch (waitError) {
                console.error("❌ Error waiting for transaction:", waitError)
              } finally {
                setIsLoading(false)
              }
            },
            onError: (err) => {
              const error = err instanceof Error ? err : new Error(String(err))
              setTransactionError(error)
              console.error("❌ Mint error:", err)
              setIsLoading(false)
            },
          }
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setTransactionError(error)
        console.error("❌ Mint error:", err)
        setIsLoading(false)
      }
    },
    [signAndExecute, iotaClient]
  )

  /**
   * Add a lifecycle event to the Digital Twin
   */
  const addEvent = useCallback(
    async (eventType: number, description: string) => {
      if (!objectId) return
      if (!description.trim()) {
        setTransactionError(new Error("Description cannot be empty"))
        return
      }

      try {
        setIsLoading(true)
        setTransactionError(null)

        const tx = new Transaction()
        const descBytes = new TextEncoder().encode(description)

        tx.moveCall({
          arguments: [
            tx.object(objectId),
            tx.pure.u8(eventType),
            tx.pure.vector("u8", Array.from(descBytes)),
          ],
          target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.ADD_EVENT}`,
        })

        signAndExecute(
          { transaction: tx.serialize() },
          {
            onSuccess: async ({ digest }) => {
              setHash(digest)
              await iotaClient.waitForTransaction({ digest })
              await refetch()
              console.log("✅ Event added")
              setIsLoading(false)
            },
            onError: (err) => {
              const error = err instanceof Error ? err : new Error(String(err))
              setTransactionError(error)
              console.error("❌ Add event error:", err)
              setIsLoading(false)
            },
          }
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setTransactionError(error)
        console.error("❌ Add event error:", err)
        setIsLoading(false)
      }
    },
    [objectId, signAndExecute, iotaClient, refetch]
  )

  /**
   * Report the Digital Twin as lost
   */
  const reportLost = useCallback(async () => {
    if (!objectId) return

    try {
      setIsLoading(true)
      setTransactionError(null)

      const tx = new Transaction()
      tx.moveCall({
        arguments: [tx.object(objectId)],
        target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.REPORT_LOST}`,
      })

      signAndExecute(
        { transaction: tx.serialize() },
        {
          onSuccess: async ({ digest }) => {
            setHash(digest)
            await iotaClient.waitForTransaction({ digest })
            await refetch()
            console.log("✅ Reported lost")
            setIsLoading(false)
          },
          onError: (err) => {
            const error = err instanceof Error ? err : new Error(String(err))
            setTransactionError(error)
            console.error("❌ Report lost error:", err)
            setIsLoading(false)
          },
        }
      )
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      setTransactionError(error)
      console.error("❌ Report lost error:", err)
      setIsLoading(false)
    }
  }, [objectId, signAndExecute, iotaClient, refetch])

  /**
   * Transfer ownership of the Digital Twin
   */
  const transferTwin = useCallback(
    async (recipient: string) => {
      if (!objectId) return
      if (!recipient.trim()) {
        setTransactionError(new Error("Recipient address cannot be empty"))
        return
      }

      try {
        setIsLoading(true)
        setTransactionError(null)

        const tx = new Transaction()
        tx.moveCall({
          arguments: [tx.object(objectId), tx.pure.address(recipient)],
          target: `${PACKAGE_ID}::${CONTRACT_MODULE}::${CONTRACT_METHODS.TRANSFER_TWIN}`,
        })

        signAndExecute(
          { transaction: tx.serialize() },
          {
            onSuccess: async ({ digest }) => {
              setHash(digest)
              await iotaClient.waitForTransaction({ digest })
              await refetch()
              console.log("✅ Twin transferred")
              setIsLoading(false)
            },
            onError: (err) => {
              const error = err instanceof Error ? err : new Error(String(err))
              setTransactionError(error)
              console.error("❌ Transfer error:", err)
              setIsLoading(false)
            },
          }
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setTransactionError(error)
        console.error("❌ Transfer error:", err)
        setIsLoading(false)
      }
    },
    [objectId, signAndExecute, iotaClient, refetch]
  )

  /**
   * Clear current object and start fresh
   */
  const clearObject = useCallback(() => {
    setObjectId(null)
    setTransactionError(null)
    setHash(undefined)
    if (typeof window !== "undefined") {
      window.location.hash = ""
    }
  }, [])

  // ============================================================================
  // RETURN VALUES
  // ============================================================================

  const actions: ContractActions = {
    mintToSender,
    addEvent,
    reportLost,
    transferTwin,
    clearObject,
  }

  const contractState: ContractState = {
    isLoading: (isLoading && !objectId) || isPending || isFetching,
    isPending,
    isConfirming: false,
    isConfirmed: !!hash && !isLoading && !isPending,
    hash,
    error: queryError || transactionError,
  }

  return {
    data: fields,
    actions,
    state: contractState,
    objectId,
    isOwner,
    objectExists,
    hasValidData,
  }
}