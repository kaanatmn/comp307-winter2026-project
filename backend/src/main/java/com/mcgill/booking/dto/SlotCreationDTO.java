package com.mcgill.booking.dto;

import com.mcgill.booking.entity.BookingSlot.SlotType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class SlotCreationDTO {

    @NotBlank(message = "Owner email is required")
    private String ownerEmail;

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @NotNull(message = "Slot type is required")
    private SlotType type;

    private Integer recurringWeeks = 1;

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public SlotType getType() { return type; }
    public void setType(SlotType type) { this.type = type; }

    public Integer getRecurringWeeks() { return recurringWeeks; }
    public void setRecurringWeeks(Integer recurringWeeks) { this.recurringWeeks = recurringWeeks; }
}