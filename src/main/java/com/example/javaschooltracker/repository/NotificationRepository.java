package com.example.javaschooltracker.repository;

import com.example.javaschooltracker.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {
}