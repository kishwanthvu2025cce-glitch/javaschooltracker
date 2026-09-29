package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Attendance;
import com.example.javaschooltracker.model.Invoice;
import com.example.javaschooltracker.model.Payment;
import com.example.javaschooltracker.model.Purchase;
import com.example.javaschooltracker.repository.AttendanceRepository;
import com.example.javaschooltracker.repository.InvoiceRepository;
import com.example.javaschooltracker.repository.PaymentRepository;
import com.example.javaschooltracker.repository.PurchaseRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportService {

    private final AttendanceRepository attendanceRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final PurchaseRepository purchaseRepository;

    public ReportService(AttendanceRepository attendanceRepository,
                         InvoiceRepository invoiceRepository,
                         PaymentRepository paymentRepository,
                         PurchaseRepository purchaseRepository) {

        this.attendanceRepository = attendanceRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.purchaseRepository = purchaseRepository;
    }


    // ATTENDANCE REPORT
    public Map<String, Object> getAttendanceReport() {

        List<Attendance> attendanceList =
                attendanceRepository.findAll();

        long present = attendanceList.stream()
                .filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus()))
                .count();

        long absent = attendanceList.stream()
                .filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus()))
                .count();

        Map<String, Object> report = new HashMap<>();

        report.put("totalRecords", attendanceList.size());
        report.put("present", present);
        report.put("absent", absent);

        report.put(
                "attendancePercentage",
                attendanceList.isEmpty()
                        ? 0.0
                        : (present * 100.0) / attendanceList.size()
        );

        return report;
    }


    // FEE COLLECTION REPORT
    public Map<String, Object> getFeeCollectionReport() {

        List<Invoice> invoices =
                invoiceRepository.findAll();

        List<Payment> payments =
                paymentRepository.findAll();

        double totalInvoiceAmount = invoices.stream()
                .mapToDouble(Invoice::getAmount)
                .sum();

        double totalCollectedAmount = payments.stream()
                .filter(payment ->
                        "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                .mapToDouble(Payment::getAmountPaid)
                .sum();

        // Pending amount can never be negative
        double pendingAmount =
                Math.max(0, totalInvoiceAmount - totalCollectedAmount);

        Map<String, Object> report = new HashMap<>();

        report.put("totalInvoices", invoices.size());

        report.put(
                "totalInvoiceAmount",
                totalInvoiceAmount
        );

        report.put(
                "totalPayments",
                payments.size()
        );

        report.put(
                "totalCollectedAmount",
                totalCollectedAmount
        );

        report.put(
                "pendingAmount",
                pendingAmount
        );

        return report;
    }


    // EXPENSE REPORT
    public Map<String, Object> getExpenseReport() {

        List<Purchase> purchases =
                purchaseRepository.findAll();

        double totalExpense = purchases.stream()
                .mapToDouble(Purchase::getAmount)
                .sum();

        Map<String, Object> report = new HashMap<>();

        report.put(
                "totalPurchases",
                purchases.size()
        );

        report.put(
                "totalExpense",
                totalExpense
        );

        return report;
    }


    // PROFIT AND LOSS REPORT
    public Map<String, Object> getProfitAndLossReport() {

        List<Payment> payments =
                paymentRepository.findAll();

        List<Purchase> purchases =
                purchaseRepository.findAll();

        double totalIncome = payments.stream()
                .filter(payment ->
                        "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                .mapToDouble(Payment::getAmountPaid)
                .sum();

        double totalExpense = purchases.stream()
                .mapToDouble(Purchase::getAmount)
                .sum();

        double profitOrLoss =
                totalIncome - totalExpense;

        Map<String, Object> report = new HashMap<>();

        report.put(
                "totalIncome",
                totalIncome
        );

        report.put(
                "totalExpense",
                totalExpense
        );

        report.put(
                "profitOrLoss",
                profitOrLoss
        );

        return report;
    }
}