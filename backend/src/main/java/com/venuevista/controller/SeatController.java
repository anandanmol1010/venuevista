package com.venuevista.controller;

import com.venuevista.dto.SeatDTO;
import com.venuevista.service.SeatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @PutMapping("/{id}")
    public ResponseEntity<SeatDTO> updateSeat(@PathVariable Long id, @Valid @RequestBody SeatDTO dto) {
        return ResponseEntity.ok(seatService.updateSeat(id, dto));
    }
}
