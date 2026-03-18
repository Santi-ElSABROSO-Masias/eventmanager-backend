"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationsController = void 0;
const authorizations_service_1 = require("./authorizations.service");
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("../../config/env");
class AuthorizationsController {
    authService = new authorizations_service_1.AuthorizationsService();
    // --- File Uploads ---
    uploadFile = async (req, res) => {
        try {
            if (!req.file)
                throw new Error('No se recibió archivo');
            const supabaseUrl = process.env.VITE_SUPABASE_URL || env_1.env.SUPABASE_URL || '';
            const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || env_1.env.SUPABASE_SERVICE_KEY || env_1.env.SUPABASE_ANON_KEY || '';
            if (!supabaseUrl || !supabaseKey)
                throw new Error('Faltan credenciales de Supabase en el Backend');
            const supabaseClient = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;
            const { data, error } = await supabaseClient.storage
                .from('autorizaciones')
                .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });
            if (error)
                throw error;
            const { data: urlData } = supabaseClient.storage
                .from('autorizaciones')
                .getPublicUrl(filePath);
            res.json({ success: true, url: urlData.publicUrl, name: file.originalname });
        }
        catch (error) {
            console.error('Upload Error:', error);
            res.status(400).json({ success: false, message: error.message });
        }
    };
    // --- High Risk Work ---
    createHighRiskWork = async (req, res) => {
        try {
            const data = req.body;
            const userId = req.user.id;
            const result = await this.authService.createHighRiskWork(data, userId);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    getHighRiskWorks = async (req, res) => {
        try {
            const filters = {}; // add req.query mapping
            const result = await this.authService.getHighRiskWorks(filters);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    approveHighRiskWork = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const userId = req.user.id;
            const result = await this.authService.approveHighRiskWork(id, data, userId);
            if (result.pdfBuffer) {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=Autorizacion_${id}.pdf`);
                res.status(200).send(result.pdfBuffer);
                return;
            }
            res.json({ success: true, data: result.record });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    // --- Driving Licenses ---
    createDrivingLicense = async (req, res) => {
        try {
            const data = req.body;
            const userId = req.user.id;
            const result = await this.authService.createDrivingLicense(data, userId);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    getDrivingLicenses = async (req, res) => {
        try {
            const filters = {};
            const result = await this.authService.getDrivingLicenses(filters);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    approveDrivingLicense = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const userId = req.user.id;
            const result = await this.authService.approveDrivingLicense(id, data, userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    // --- Vehicle Accreditation ---
    createVehicle = async (req, res) => {
        try {
            const data = req.body;
            const userId = req.user.id;
            const result = await this.authService.createVehicle(data, userId);
            res.status(201).json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    getVehicles = async (req, res) => {
        try {
            const filters = {};
            const result = await this.authService.getVehicles(filters);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    approveVehicle = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const userId = req.user.id;
            const result = await this.authService.approveVehicle(id, data, userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
}
exports.AuthorizationsController = AuthorizationsController;
