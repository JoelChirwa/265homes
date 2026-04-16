// backend/src/routes/listingRoutes.js
import { Router } from 'express';
import { listingsById, nowIso, usersById } from '../models/state.js';

const router = Router();

// GET all active listings
router.get('/listings', (req, res) => {
    const { city, maxPrice, minRooms } = req.query;
    let list = Array.from(listingsById.values()).filter(l => l.status === 'active' && !l.isDeleted);
    
    if (city) list = list.filter(l => l.city === city);
    if (maxPrice) list = list.filter(l => l.price <= Number(maxPrice));
    if (minRooms) list = list.filter(l => l.rooms >= Number(minRooms));
    
    res.json({ listings: list });
});

// GET my listings (for landlords)
router.get('/listings/mine/:landlordId', (req, res) => {
    const list = Array.from(listingsById.values()).filter(l => l.landlordId === req.params.landlordId && !l.isDeleted);
    res.json({ listings: list });
});

// POST new listing
router.post('/listings', (req, res) => {
    const { landlordId, title, description, city, area, price, rooms, amenities, images, gps } = req.body;
    
    if (!landlordId || !title || !price || !gps) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const id = `lst-${Date.now()}`;
    const newListing = {
        id,
        landlordId,
        title,
        description,
        city,
        area,
        price,
        rooms,
        amenities: amenities || [],
        images: images || [],
        gps,
        status: 'active',
        isDeleted: false,
        isVerified: true,
        createdAt: nowIso()
    };
    
    listingsById.set(id, newListing);
    res.status(201).json({ message: "Listing created", listing: newListing });
});

// DELETE listing (soft delete)
router.delete('/listings/:id', (req, res) => {
    const listing = listingsById.get(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    
    listing.isDeleted = true;
    listing.status = 'deleted_by_landlord';
    res.json({ message: "Listing deleted" });
});

// PUT update listing
router.put('/listings/:id', (req, res) => {
    const listing = listingsById.get(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    const updates = req.body;
    const updatedListing = { ...listing, ...updates, updatedAt: nowIso() };
    
    listingsById.set(req.params.id, updatedListing);
    res.json({ message: "Listing updated", listing: updatedListing });
});

export default router;
