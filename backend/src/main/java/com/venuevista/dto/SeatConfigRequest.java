package com.venuevista.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class SeatConfigRequest {

    @NotBlank(message = "Start row is required")
    private String startRow;

    @NotBlank(message = "End row is required")
    private String endRow;

    @Positive(message = "Seats per row must be positive")
    private int seatsPerRow;

    @NotNull(message = "Seat type is required")
    private String seatType;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    public String getStartRow() { return startRow; }
    public void setStartRow(String startRow) { this.startRow = startRow; }

    public String getEndRow() { return endRow; }
    public void setEndRow(String endRow) { this.endRow = endRow; }

    public int getSeatsPerRow() { return seatsPerRow; }
    public void setSeatsPerRow(int seatsPerRow) { this.seatsPerRow = seatsPerRow; }

    public String getSeatType() { return seatType; }
    public void setSeatType(String seatType) { this.seatType = seatType; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
}
