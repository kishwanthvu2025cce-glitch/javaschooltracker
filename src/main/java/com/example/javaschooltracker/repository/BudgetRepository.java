package com.example.javaschooltracker.repository;

import com.example.javaschooltracker.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
}