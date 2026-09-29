package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Budget;
import com.example.javaschooltracker.repository.BudgetRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    // Create budget
    public Budget createBudget(Budget budget) {
        return budgetRepository.save(budget);
    }

    // Get all budgets
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    // Get budget by ID
    public Budget getBudgetById(Long id) {
        return budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));
    }

    // Update budget
    public Budget updateBudget(Long id, Budget budgetDetails) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        budget.setDepartment(budgetDetails.getDepartment());
        budget.setBudgetAmount(budgetDetails.getBudgetAmount());
        budget.setActualExpense(budgetDetails.getActualExpense());
        budget.setYear(budgetDetails.getYear());

        return budgetRepository.save(budget);
    }

    // Delete budget
    public void deleteBudget(Long id) {
        budgetRepository.deleteById(id);
    }

    // Calculate budget utilization
    public double getBudgetUtilization(Long id) {

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found"));

        if (budget.getBudgetAmount() == 0) {
            return 0.0;
        }

        return (budget.getActualExpense()
                / budget.getBudgetAmount()) * 100;
    }
}