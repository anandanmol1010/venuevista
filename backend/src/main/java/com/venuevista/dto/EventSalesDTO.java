package com.venuevista.dto;

import java.math.BigDecimal;

public class EventSalesDTO {

    private Long eventId;
    private String eventTitle;
    private String category;
    private String venueName;
    private long ticketsSold;
    private BigDecimal revenue;

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getVenueName() { return venueName; }
    public void setVenueName(String venueName) { this.venueName = venueName; }

    public long getTicketsSold() { return ticketsSold; }
    public void setTicketsSold(long ticketsSold) { this.ticketsSold = ticketsSold; }

    public BigDecimal getRevenue() { return revenue; }
    public void setRevenue(BigDecimal revenue) { this.revenue = revenue; }
}
