package com.example.javaschooltracker.repository;

import com.example.javaschooltracker.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}