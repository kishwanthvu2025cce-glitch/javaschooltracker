package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Budget;
import com.example.javaschooltracker.model.Purchase;
import com.example.javaschooltracker.repository.BudgetRepository;
import com.example.javaschooltracker.repository.PurchaseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final BudgetRepository budgetRepository;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           BudgetRepository budgetRepository) {

        this.purchaseRepository = purchaseRepository;
        this.budgetRepository = budgetRepository;
    }


    // =========================
    // CREATE PURCHASE
    // =========================

    public Purchase createPurchase(Purchase purchase) {

        // Default payment status
        if (purchase.getPaymentStatus() == null) {
            purchase.setPaymentStatus("PENDING");
        }

        // Default purchase date
        if (purchase.getPurchaseDate() == null) {
            purchase.setPurchaseDate(LocalDate.now());
        }

        // Save purchase first
        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Add purchase amount to budget expense
        updateBudgetExpense(purchase.getAmount());

        return savedPurchase;
    }


    // =========================
    // UPDATE BUDGET EXPENSE
    // =========================

    private void updateBudgetExpense(double purchaseAmount) {

        List<Budget> budgets = budgetRepository.findAll();

        // If there is no budget, simply stop
        if (budgets.isEmpty()) {
            return;
        }

        // For now, use the first available budget
        Budget budget = budgets.get(0);

        double updatedExpense =
                budget.getActualExpense() + purchaseAmount;

        budget.setActualExpense(updatedExpense);

        budgetRepository.save(budget);
    }


    // =========================
    // GET ALL PURCHASES
    // =========================

    public List<Purchase> getAllPurchases() {

        return purchaseRepository.findAll();
    }


    // =========================
    // GET PURCHASE BY ID
    // =========================

    public Purchase getPurchaseById(Long id) {

        return purchaseRepository.findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Purchase not found")
                );
    }


    // =========================
    // UPDATE PURCHASE
    // =========================

    public Purchase updatePurchase(Long id,
                                   Purchase purchaseDetails) {

        Purchase existingPurchase =
                purchaseRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Purchase not found"
                                )
                        );

        // Store old amount
        double oldAmount =
                existingPurchase.getAmount();

        // Update purchase fields
        existingPurchase.setVendorId(
                purchaseDetails.getVendorId()
        );

        existingPurchase.setPurchaseDescription(
                purchaseDetails.getPurchaseDescription()
        );

        existingPurchase.setAmount(
                purchaseDetails.getAmount()
        );

        existingPurchase.setPurchaseDate(
                purchaseDetails.getPurchaseDate()
        );

        existingPurchase.setPaymentStatus(
                purchaseDetails.getPaymentStatus()
        );

        Purchase updatedPurchase =
                purchaseRepository.save(existingPurchase);

        // Adjust budget according to amount difference
        double amountDifference =
                purchaseDetails.getAmount() - oldAmount;

        updateBudgetExpense(amountDifference);

        return updatedPurchase;
    }


    // =========================
    // DELETE PURCHASE
    // =========================

    public void deletePurchase(Long id) {

        Purchase purchase =
                purchaseRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Purchase not found"
                                )
                        );

        // Get amount before deleting
        double purchaseAmount =
                purchase.getAmount();

        // Delete purchase
        purchaseRepository.deleteById(id);

        // Remove that expense from budget
        updateBudgetExpense(-purchaseAmount);
    }
}