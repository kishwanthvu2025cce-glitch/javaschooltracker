package com.example.javaschooltracker.controller;

import com.example.javaschooltracker.model.Budget;
import com.example.javaschooltracker.service.BudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // CREATE BUDGET
    @PostMapping
    public Budget createBudget(@RequestBody Budget budget) {
        return budgetService.createBudget(budget);
    }

    // GET ALL BUDGETS
    @GetMapping
    public List<Budget> getAllBudgets() {
        return budgetService.getAllBudgets();
    }

    // GET BUDGET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    budgetService.getBudgetById(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE BUDGET
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Long id,
            @RequestBody Budget budget) {

        try {
            return ResponseEntity.ok(
                    budgetService.updateBudget(id, budget)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE BUDGET
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id) {

        try {
            budgetService.deleteBudget(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // GET BUDGET UTILIZATION
    @GetMapping("/{id}/utilization")
    public ResponseEntity<Double> getBudgetUtilization(
            @PathVariable Long id) {

        try {
            return ResponseEntity.ok(
                    budgetService.getBudgetUtilization(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}