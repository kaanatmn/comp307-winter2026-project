package com.mcgill.booking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The slot being booked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slot_id", nullable = false)
    private BookingSlot slot;

    // The @mail.mcgill.ca student who booked it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    // Critical for Type 1 (Meeting Requests) where Owner must approve
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.APPROVED; 

    public enum Status {
        PENDING,   // Used for Type 1 requests
        APPROVED,  // Used for standard Type 3 office hours
        DECLINED
    }

    public Appointment() {
    }

    // --- Explicit Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BookingSlot getSlot() { return slot; }
    public void setSlot(BookingSlot slot) { this.slot = slot; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}