package com.mcgill.booking.controller;

import com.mcgill.booking.entity.GroupOption;
import com.mcgill.booking.entity.GroupPoll;
import com.mcgill.booking.service.GroupMeetingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/group")
public class GroupMeetingController {

    private final GroupMeetingService groupMeetingService;

    public GroupMeetingController(GroupMeetingService groupMeetingService) {
        this.groupMeetingService = groupMeetingService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createPoll(Authentication authentication, @RequestBody Map<String, Object> payload) {
        try {
            String title = (String) payload.get("title");
            List<String> timeStrings = (List<String>) payload.get("startTimes");
            List<LocalDateTime> startTimes = timeStrings.stream().map(LocalDateTime::parse).toList();
            
            groupMeetingService.createPoll(authentication.getName(), title, startTimes);
            return ResponseEntity.ok(Map.of("message", "Group Poll created successfully"));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/active")
    public ResponseEntity<?> getActivePolls() {
        return ResponseEntity.ok(buildPollResponse(groupMeetingService.getActivePolls()));
    }

    @GetMapping("/my-polls")
    public ResponseEntity<?> getMyPolls(Authentication authentication) {
        return ResponseEntity.ok(buildPollResponse(groupMeetingService.getMyPolls(authentication.getName())));
    }

    @PostMapping("/vote/{optionId}")
    public ResponseEntity<?> vote(Authentication authentication, @PathVariable Long optionId) {
        try {
            groupMeetingService.vote(authentication.getName(), optionId);
            return ResponseEntity.ok(Map.of("message", "Vote recorded successfully"));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/finalize/{pollId}/{optionId}")
    public ResponseEntity<?> finalizePoll(Authentication authentication, @PathVariable Long pollId, @PathVariable Long optionId, @RequestParam(defaultValue = "1") int weeks) {
        try {
            groupMeetingService.finalizePoll(authentication.getName(), pollId, optionId, weeks);
            return ResponseEntity.ok(Map.of("message", "Poll finalized and slots generated!"));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    private List<Map<String, Object>> buildPollResponse(List<GroupPoll> polls) {
        List<Map<String, Object>> response = new ArrayList<>();
        for (GroupPoll poll : polls) {
            Map<String, Object> pollMap = new HashMap<>();
            pollMap.put("id", poll.getId());
            pollMap.put("title", poll.getTitle());
            pollMap.put("profName", poll.getOwner().getName());
            pollMap.put("profEmail", poll.getOwner().getEmail());
            pollMap.put("active", poll.isActive());
            
            List<GroupOption> options = groupMeetingService.getOptionsForPoll(poll.getId());
            List<Map<String, Object>> optionsList = new ArrayList<>();
            for (GroupOption opt : options) {
                Map<String, Object> optMap = new HashMap<>();
                optMap.put("id", opt.getId());
                optMap.put("startTime", opt.getStartTime().toString());
                optMap.put("endTime", opt.getEndTime().toString());
                optMap.put("votes", groupMeetingService.getVoteCount(opt.getId()));
                optionsList.add(optMap);
            }
            pollMap.put("options", optionsList);
            response.add(pollMap);
        }
        return response;
    }
}