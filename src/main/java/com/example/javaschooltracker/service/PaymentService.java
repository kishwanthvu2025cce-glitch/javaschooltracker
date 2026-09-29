package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Invoice;
import com.example.javaschooltracker.model.Payment;
import com.example.javaschooltracker.repository.InvoiceRepository;
import com.example.javaschooltracker.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          InvoiceRepository invoiceRepository) {

        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // CREATE PAYMENT
    public Payment createPayment(Payment payment) {

        // Check whether invoice exists
        Invoice invoice = invoiceRepository.findById(payment.getInvoiceId())
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Calculate how much has already been paid
        double alreadyPaid = paymentRepository.findAll().stream()
                .filter(p -> payment.getInvoiceId().equals(p.getInvoiceId()))
                .filter(p -> "SUCCESS".equalsIgnoreCase(p.getStatus()))
                .mapToDouble(Payment::getAmountPaid)
                .sum();

        // Calculate remaining amount
        double remainingAmount = invoice.getAmount() - alreadyPaid;

        // Prevent overpayment
        if (payment.getAmountPaid() > remainingAmount) {

            throw new RuntimeException(
                    "Payment exceeds remaining invoice amount. Remaining amount: ₹"
                            + remainingAmount
            );
        }

        // Default payment status
        if (payment.getStatus() == null) {
            payment.setStatus("SUCCESS");
        }

        // Default payment date
        if (payment.getPaymentDate() == null) {
            payment.setPaymentDate(LocalDate.now());
        }

        // Save payment
        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice status
        updateInvoiceStatus(payment.getInvoiceId());

        return savedPayment;
    }


    // UPDATE INVOICE STATUS
    private void updateInvoiceStatus(Long invoiceId) {

        if (invoiceId == null) {
            return;
        }

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Calculate total successful payments
        double totalPaid = paymentRepository.findAll().stream()
                .filter(payment -> invoiceId.equals(payment.getInvoiceId()))
                .filter(payment -> "SUCCESS".equalsIgnoreCase(payment.getStatus()))
                .mapToDouble(Payment::getAmountPaid)
                .sum();

        // Decide invoice status
        if (totalPaid >= invoice.getAmount()) {

            invoice.setStatus("PAID");

        } else if (totalPaid > 0) {

            invoice.setStatus("PARTIALLY_PAID");

        } else {

            invoice.setStatus("PENDING");
        }

        invoiceRepository.save(invoice);
    }


    // GET ALL PAYMENTS
    public List<Payment> getAllPayments() {

        return paymentRepository.findAll();
    }


    // GET PAYMENT BY ID
    public Payment getPaymentById(Long id) {

        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }


    // UPDATE PAYMENT
    public Payment updatePayment(Long id, Payment paymentDetails) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setInvoiceId(paymentDetails.getInvoiceId());
        payment.setStudentId(paymentDetails.getStudentId());
        payment.setAmountPaid(paymentDetails.getAmountPaid());
        payment.setPaymentDate(paymentDetails.getPaymentDate());
        payment.setPaymentMethod(paymentDetails.getPaymentMethod());
        payment.setStatus(paymentDetails.getStatus());

        Payment updatedPayment = paymentRepository.save(payment);

        // Recalculate invoice status
        updateInvoiceStatus(payment.getInvoiceId());

        return updatedPayment;
    }


    // DELETE PAYMENT
    public void deletePayment(Long id) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Long invoiceId = payment.getInvoiceId();

        paymentRepository.deleteById(id);

        // Recalculate invoice status after deletion
        updateInvoiceStatus(invoiceId);
    }
}