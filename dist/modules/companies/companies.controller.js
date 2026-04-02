"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesController = void 0;
const companies_service_1 = require("./companies.service");
class CompaniesController {
    companiesService = new companies_service_1.CompaniesService();
    create = async (req, res) => {
        try {
            const createDto = req.body;
            const company = await this.companiesService.create(createDto);
            res.status(201).json({ success: true, data: company });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    findAll = async (req, res) => {
        try {
            const user = req.user;
            let companies;
            if (user.role === 'admin_contratista') {
                if (!user.companyId) {
                    return res.json({ success: true, data: [] });
                }
                const company = await this.companiesService.findOne(user.companyId);
                // Mantenemos formato de array para consistencia con findAll
                companies = company ? [company] : [];
            }
            else {
                // super_super_admin y super_admin ven todas las empresas
                companies = await this.companiesService.findAll();
            }
            res.json({ success: true, data: companies });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    findOne = async (req, res) => {
        try {
            const id = req.params.id;
            const user = req.user;
            // Verificación de seguridad para admin_contratista
            if (user.role === 'admin_contratista' && user.companyId !== id) {
                return res.status(403).json({ success: false, message: 'No tiene permiso para ver esta empresa' });
            }
            const company = await this.companiesService.findOne(id);
            if (!company) {
                return res.status(404).json({ success: false, message: 'Empresa no encontrada' });
            }
            res.json({ success: true, data: company });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
    update = async (req, res) => {
        try {
            const id = req.params.id;
            const updateDto = req.body;
            const company = await this.companiesService.update(id, updateDto);
            res.json({ success: true, data: company });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    requestQuota = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const userId = req.user.id;
            const company = await this.companiesService.requestQuota(id, data, userId);
            res.json({ success: true, data: company, message: 'Solicitud de cupos enviada' });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    approveQuota = async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            const userId = req.user.id;
            const company = await this.companiesService.approveQuota(id, data, userId);
            res.json({ success: true, data: company, message: `Cupos ${data.status === 'approved' ? 'aprobados' : 'rechazados'}` });
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    };
    getQuotaHistory = async (req, res) => {
        try {
            const id = req.params.id;
            const history = await this.companiesService.getQuotaHistory(id);
            res.json({ success: true, data: history });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };
}
exports.CompaniesController = CompaniesController;
