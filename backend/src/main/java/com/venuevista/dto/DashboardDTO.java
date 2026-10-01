package com.venuevista.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardDTO {

    private long totalEvents;
    private long totalVenues;
    private long totalUsers;
    private long totalBookings;
    private BigDecimal totalRevenue;
    private List<BookingDTO> recentBookings;

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getTotalVenues() { return totalVenues; }
    public void setTotalVenues(long totalVenues) { this.totalVenues = totalVenues; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public List<BookingDTO> getRecentBookings() { return recentBookings; }
    public void setRecentBookings(List<BookingDTO> recentBookings) { this.recentBookings = recentBookings; }
}
