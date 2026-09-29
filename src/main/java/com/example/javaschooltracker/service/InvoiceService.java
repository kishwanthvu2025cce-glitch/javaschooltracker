package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Invoice;
import com.example.javaschooltracker.repository.InvoiceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    public InvoiceService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // Create invoice
    public Invoice createInvoice(Invoice invoice) {

        if (invoice.getStatus() == null) {
            invoice.setStatus("PENDING");
        }

        return invoiceRepository.save(invoice);
    }

    // Get all invoices
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Get invoice by ID
    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));
    }

    // Update invoice
    public Invoice updateInvoice(Long id, Invoice invoiceDetails) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        invoice.setStudentId(invoiceDetails.getStudentId());
        invoice.setInvoiceNumber(invoiceDetails.getInvoiceNumber());
        invoice.setAmount(invoiceDetails.getAmount());
        invoice.setDueDate(invoiceDetails.getDueDate());
        invoice.setStatus(invoiceDetails.getStatus());

        return invoiceRepository.save(invoice);
    }

    // Delete invoice
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }
}