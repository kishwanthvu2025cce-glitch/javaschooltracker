package com.example.javaschooltracker.service;

import com.example.javaschooltracker.model.Vendor;
import com.example.javaschooltracker.repository.VendorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;

    public VendorService(VendorRepository vendorRepository) {
        this.vendorRepository = vendorRepository;
    }

    // Create vendor
    public Vendor createVendor(Vendor vendor) {
        return vendorRepository.save(vendor);
    }

    // Get all vendors
    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    // Get vendor by ID
    public Vendor getVendorById(Long id) {
        return vendorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vendor not found"));
    }

    // Update vendor
    public Vendor updateVendor(Long id, Vendor vendorDetails) {

        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Vendor not found"));

        vendor.setVendorName(vendorDetails.getVendorName());
        vendor.setContactPerson(vendorDetails.getContactPerson());
        vendor.setPhone(vendorDetails.getPhone());
        vendor.setEmail(vendorDetails.getEmail());
        vendor.setAddress(vendorDetails.getAddress());

        return vendorRepository.save(vendor);
    }

    // Delete vendor
    public void deleteVendor(Long id) {
        vendorRepository.deleteById(id);
    }
}