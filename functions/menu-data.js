// This tells Cloudflare to use the `xlsx` library, which is available on their platform.
// This line might vary depending on how you're bundling your functions.
// For a simple function, this should be fine.
import * as XLSX from 'xlsx/xlsx.mjs';

export async function onRequest({ request, env }) {
    try {
        // Construct the URL to the Excel file in the public directory
        const excelFileUrl = new URL('/menu-items.xlsx', request.url);
        
        // Fetch the Excel file from your deployed public directory
        const response = await fetch(excelFileUrl.href);

        if (!response.ok) {
            return new Response('Excel file not found or could not be fetched.', { status: 404 });
        }

        // Read the file as an ArrayBuffer
        const data = await response.arrayBuffer();

        // Use the XLSX library to parse the Excel file
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert the sheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Ensure the data has the correct headers
        const menuItems = jsonData.map(row => ({
            name: row.Name,
            price: parseFloat(row.Price) || 0
        }));

        return new Response(JSON.stringify(menuItems), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error processing Excel file:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}