import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const GEMINI_MODEL = 'gemini-2.5-flash';

app.use(express.json());

/* =========================
   ENDPOINT TEXT
========================= */

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });

        res.status(200).json({
            result: response.text
        });

    } catch (e) {
        console.log(e);

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
        const base64Image = req.file.buffer.toString('base64');

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    text: prompt ?? 'Jelaskan isi gambar berikut.'
                },
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: req.file.mimetype
                    }
                }
            ]
        });

        res.status(200).json({
            result: response.text
        });

    } catch (e) {
        console.log(e);

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
        const base64Document = req.file.buffer.toString('base64');

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    text: prompt ?? 'Tolong buat ringkasan dari dokumen berikut.'
                },
                {
                    inlineData: {
                        data: base64Document,
                        mimeType: req.file.mimetype
                    }
                }
            ]
        });

        res.status(200).json({
            result: response.text
        });

    } catch (e) {
        console.log(e);

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
        const base64Audio = req.file.buffer.toString('base64');

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                {
                    text: prompt ?? 'Tolong buatkan transkrip dari rekaman berikut.'
                },
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: req.file.mimetype
                    }
                }
            ]
        });

        res.status(200).json({
            result: response.text
        });

    } catch (e) {
        console.log(e);

        res.status(500).json({
            message: e.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);
});