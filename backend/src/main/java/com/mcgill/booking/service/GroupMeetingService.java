package com.mcgill.booking.service;

import com.mcgill.booking.entity.*;
import com.mcgill.booking.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class GroupMeetingService {

    private final GroupPollRepository pollRepository;
    private final GroupOptionRepository optionRepository;
    private final GroupVoteRepository voteRepository;
    private final UserRepository userRepository;
    private final TimeSlotRepository timeSlotRepository;

    public GroupMeetingService(GroupPollRepository pollRepository, GroupOptionRepository optionRepository,
                               GroupVoteRepository voteRepository, UserRepository userRepository, TimeSlotRepository timeSlotRepository) {
        this.pollRepository = pollRepository;
        this.optionRepository = optionRepository;
        this.voteRepository = voteRepository;
        this.userRepository = userRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    public GroupPoll createPoll(String ownerEmail, String title, List<LocalDateTime> startTimes) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("Owner not found"));
        
        GroupPoll poll = new GroupPoll();
        poll.setOwner(owner);
        poll.setTitle(title);
        poll = pollRepository.save(poll);

        for (LocalDateTime startTime : startTimes) {
            GroupOption option = new GroupOption();
            option.setPoll(poll);
            option.setStartTime(startTime);
            option.setEndTime(startTime.plusHours(1)); 
            optionRepository.save(option);
        }
        return poll;
    }

    public List<GroupPoll> getActivePolls() { return pollRepository.findByActiveTrue(); }
    public List<GroupPoll> getMyPolls(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail).orElseThrow(() -> new RuntimeException("Owner not found"));
        return pollRepository.findByOwnerId(owner.getId());
    }
    public List<GroupOption> getOptionsForPoll(Long pollId) { return optionRepository.findByPollId(pollId); }
    public int getVoteCount(Long optionId) { return voteRepository.findByOptionId(optionId).size(); }

    public void vote(String studentEmail, Long optionId) {
        User student = userRepository.findByEmail(studentEmail).orElseThrow(() -> new RuntimeException("Student not found"));
        GroupOption option = optionRepository.findById(optionId).orElseThrow(() -> new RuntimeException("Option not found"));
        
        if (!voteRepository.existsByOptionIdAndStudentId(optionId, student.getId())) {
            GroupVote vote = new GroupVote();
            vote.setOption(option);
            vote.setStudent(student);
            voteRepository.save(vote);
        }
    }

    public void finalizePoll(String ownerEmail, Long pollId, Long winningOptionId, int weeks) {
        GroupPoll poll = pollRepository.findById(pollId).orElseThrow(() -> new RuntimeException("Poll not found"));
        if (!poll.getOwner().getEmail().equals(ownerEmail)) throw new RuntimeException("Unauthorized");

        GroupOption winningOption = optionRepository.findById(winningOptionId).orElseThrow(() -> new RuntimeException("Option not found"));
        List<GroupVote> votes = voteRepository.findByOptionId(winningOptionId);
        
        for (int i = 0; i < weeks; i++) {
            for (GroupVote vote : votes) {
                TimeSlot slot = new TimeSlot();
                slot.setOwner(poll.getOwner());
                slot.setStudent(vote.getStudent());
                slot.setStartTime(winningOption.getStartTime().plusWeeks(i));
                slot.setEndTime(winningOption.getEndTime().plusWeeks(i));
                slot.setActive(true);
                slot.setBooked(true);
                slot.setType("GROUP");
                slot.setTitle(poll.getTitle());
                timeSlotRepository.save(slot);
            }
        }
        poll.setActive(false);
        pollRepository.save(poll);
    }
}