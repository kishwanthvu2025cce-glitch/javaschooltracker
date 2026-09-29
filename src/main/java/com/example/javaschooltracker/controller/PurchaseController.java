package com.example.javaschooltracker.controller;

import com.example.javaschooltracker.model.Purchase;
import com.example.javaschooltracker.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    // CREATE PURCHASE
    @PostMapping
    public Purchase createPurchase(@Valid @RequestBody Purchase purchase) {
        return purchaseService.createPurchase(purchase);
    }

    // GET ALL PURCHASES
    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseService.getAllPurchases();
    }

    // GET PURCHASE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Purchase> getPurchaseById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(
                    purchaseService.getPurchaseById(id)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // UPDATE PURCHASE
    @PutMapping("/{id}")
    public ResponseEntity<Purchase> updatePurchase(
            @PathVariable Long id,
            @Valid @RequestBody Purchase purchase) {

        try {
            return ResponseEntity.ok(
                    purchaseService.updatePurchase(id, purchase)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE PURCHASE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
        try {
            purchaseService.deletePurchase(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}