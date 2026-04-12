package com.mcgill.booking.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "group_votes")
public class GroupVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "option_id", nullable = false)
    private GroupOption option;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    public GroupVote() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public GroupOption getOption() { return option; }
    public void setOption(GroupOption option) { this.option = option; }
    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }
}