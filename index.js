import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const upload = multer();

// Menggunakan SDK yang lebih stabil
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = 'gemini-2.5-flash';

const systemInstruction = "Kamu adalah BeritaAi, asisten AI pintar berbahasa Indonesia. Tugas utamamu adalah menganalisis dan mengklasifikasikan apakah sebuah berita, informasi, gambar, atau link yang diberikan pengguna adalah FAKTA atau HOAX. Kamu harus memberikan analisis yang mendalam, alasan logis, dan menjabarkan bukti-bukti yang mendukung kesimpulanmu. Jika pengguna bertanya hal lain, tetap jawab dalam bahasa Indonesia dengan ramah.";

app.use(express.json());
app.use(express.static('public'));

/* =========================
   ENDPOINT TEXT
========================= */

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction });
        const result = await model.generateContent(prompt);
        const response = await result.response;

        res.status(200).json({
            result: response.text()
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: e.message
        });
    }
});

/* =========================
   ENDPOINT IMAGE
========================= */

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;

    if (!req.file) {
        return res.status(400).json({
            message: 'File gambar wajib diupload'
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction });

        const imageData = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt ?? 'Jelaskan isi gambar berikut.', imageData]);
        const response = await result.response;

        res.status(200).json({
            result: response.text()
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: e.message
        });
    }
});

/* =========================
   ENDPOINT DOCUMENT
========================= */

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;

    if (!req.file) {
        return res.status(400).json({
            message: 'File dokumen wajib diupload'
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction });

        const docData = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt ?? 'Tolong buat ringkasan dari dokumen berikut.', docData]);
        const response = await result.response;

        res.status(200).json({
            result: response.text()
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: e.message
        });
    }
});

/* =========================
   ENDPOINT AUDIO
========================= */

app.post('/generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;

    if (!req.file) {
        return res.status(400).json({
            message: 'File audio wajib diupload'
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: GEMINI_MODEL, systemInstruction });

        const audioData = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const result = await model.generateContent([prompt ?? 'Tolong buatkan transkrip dari rekaman berikut.', audioData]);
        const response = await result.response;

        res.status(200).json({
            result: response.text()
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: e.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);
});