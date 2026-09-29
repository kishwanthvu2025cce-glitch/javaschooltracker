package com.example.javaschooltracker.repository;

import com.example.javaschooltracker.model.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
}