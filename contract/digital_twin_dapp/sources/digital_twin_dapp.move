module digital_twin_dapp::contract {
    use std::vector;
    use iota::object;
    use iota::tx_context;
    use iota::transfer;

    // =========================================================================
    // CONSTANTS
    // =========================================================================
    
    const INITIAL_TRUST_SCORE: u64 = 50;
    const MAX_TRUST_SCORE: u64 = 100;
    const MIN_TRUST_SCORE: u64 = 0;
    
    // Event types
    const EVENT_CREATED: u8 = 0;
    const EVENT_MAINTENANCE: u8 = 1;
    const EVENT_DAMAGE: u8 = 2;
    const EVENT_INSPECTION: u8 = 3;
    const EVENT_LOST: u8 = 4;
    const EVENT_VERIFICATION: u8 = 5;

    // =========================================================================
    // STRUCTS
    // =========================================================================

    /// Represents a single lifecycle event in the twin's history
    public struct LifecycleEvent has copy, drop, store {
        event_type: u8,
        description: vector<u8>,
    }

    /// Main Digital Twin object - represents a real-world asset on-chain
    public struct DigitalTwin has key, store {
        id: object::UID,
        owner: address,
        metadata: vector<u8>,      // Asset description
        trust_score: u64,           // Reliability score (0-100)
        logs: vector<LifecycleEvent>, // Complete event history
    }

    // =========================================================================
    // PUBLIC VIEW FUNCTIONS
    // =========================================================================

    /// Get the current trust score of a digital twin
    public fun get_trust_score(twin: &DigitalTwin): u64 {
        twin.trust_score
    }

    /// Get the owner address of a digital twin
    public fun get_owner(twin: &DigitalTwin): address {
        twin.owner
    }

    // =========================================================================
    // PUBLIC ENTRY FUNCTIONS
    // =========================================================================

    /// Create a new Digital Twin and transfer to sender
    /// - metadata: Description of the asset (e.g., "Laptop Dell XPS 15")
    /// - Initial trust score: 50/100 (neutral)
    #[allow(lint(self_transfer))]
    public fun mint_to_sender(
        metadata: vector<u8>,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Initialize logs with creation event
        let mut logs = vector::empty<LifecycleEvent>();
        vector::push_back(&mut logs, LifecycleEvent {
            event_type: EVENT_CREATED,
            description: b"Created",
        });

        // Create the twin
        let twin = DigitalTwin {
            id: object::new(ctx),
            owner: sender,
            metadata,
            trust_score: INITIAL_TRUST_SCORE,
            logs,
        };

        transfer::public_transfer(twin, sender);
    }

    /// Add a lifecycle event to the twin
    /// - event_type: 1=Maintenance, 2=Damage, 3=Inspection, 5=Verification
    /// - desc: Event description
    /// Trust score changes:
    ///   - Maintenance (+5): Regular upkeep
    ///   - Damage (-3): Minor issue detected
    ///   - Inspection (+2): Quality check passed
    ///   - Verification (+10): Official authentication
    #[allow(lint(self_transfer))]
    public fun add_event(
        twin: &mut DigitalTwin,
        event_type: u8,
        desc: vector<u8>,
        _ctx: &mut tx_context::TxContext
    ) {
        // Add event to log
        vector::push_back(&mut twin.logs, LifecycleEvent {
            event_type,
            description: desc,
        });

        // Update trust score based on event type
        apply_trust_change(twin, event_type);
    }

    /// Report the twin as lost
    /// - Adds "Reported lost" event
    /// - Severely reduces trust score (-50)
    #[allow(lint(self_transfer))]
    public fun report_lost(
        twin: &mut DigitalTwin,
        _ctx: &mut tx_context::TxContext
    ) {
        vector::push_back(&mut twin.logs, LifecycleEvent {
            event_type: EVENT_LOST,
            description: b"Reported lost",
        });

        apply_trust_change(twin, EVENT_LOST);
    }

    /// Transfer ownership of the digital twin to another address
    #[allow(lint(self_transfer))]
    public fun transfer_twin(
        twin: DigitalTwin,
        recipient: address,
        _ctx: &mut tx_context::TxContext
    ) {
        transfer::public_transfer(twin, recipient);
    }

    // =========================================================================
    // INTERNAL FUNCTIONS
    // =========================================================================

    /// Apply trust score changes based on event type
    fun apply_trust_change(twin: &mut DigitalTwin, event_type: u8) {
        let score_ref = &mut twin.trust_score;

        if (event_type == EVENT_MAINTENANCE) {
            increase(score_ref, 5);
        } else if (event_type == EVENT_DAMAGE) {
            decrease(score_ref, 3);
        } else if (event_type == EVENT_INSPECTION) {
            increase(score_ref, 2);
        } else if (event_type == EVENT_LOST) {
            decrease(score_ref, 50);
        } else if (event_type == EVENT_VERIFICATION) {
            increase(score_ref, 10);
        };
    }

    /// Increase trust score with ceiling at MAX_TRUST_SCORE
    fun increase(score: &mut u64, delta: u64) {
        let new_score = *score + delta;
        *score = if (new_score > MAX_TRUST_SCORE) {
            MAX_TRUST_SCORE
        } else {
            new_score
        };
    }

    /// Decrease trust score with floor at MIN_TRUST_SCORE
    fun decrease(score: &mut u64, delta: u64) {
        *score = if (*score <= delta) {
            MIN_TRUST_SCORE
        } else {
            *score - delta
        };
    }
}