package com.example.javaschooltracker.repository;

import com.example.javaschooltracker.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
}