package com.mcgill.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_slots")
@Data
@NoArgsConstructor
public class BookingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The @mcgill.ca owner who created this slot
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlotType type;

    @Column(nullable = false)
    private LocalDateTime startTime;

    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private boolean isActive = false; // Slots start out private 

    // For Type 2 (Group) and Heatmap counting 
    private Integer maxAttendees = 1; 
    private Integer currentSelectionCount = 0; 

    // Helper enum for different project requirements
    public enum SlotType {
        REQUEST_MEETING,  // Type 1 
        CALENDAR_GROUP,   // Type 2 
        RECURRING_OFFICE, // Type 3 
        HEATMAP           // Bonus 
    }
}