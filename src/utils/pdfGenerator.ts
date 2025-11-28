/**
 * PDF Generator Utility - Phase 2: Export Trip as PDF
 * 
 * Generates printable PDF reports for flights and trips.
 * Uses browser's print functionality with print-specific CSS.
 * 
 * Usage:
 *   import { generateFlightPDF, generateTripPDF } from './pdfGenerator';
 *   
 *   // Generate PDF for a single flight
 *   generateFlightPDF(flight);
 *   
 *   // Generate PDF for a trip with multiple flights
 *   generateTripPDF(trip, flights);
 */

import type { Flight, Trip } from '../types';
import { formatDistance, formatDuration, formatDate } from './formatters';
import { calculateFlightEmissions, formatEmissions } from './carbonCalculator';

/**
 * Generates an HTML document for PDF export and triggers print
 * 
 * @param title - Document title
 * @param content - HTML content
 */
function openPrintWindow(title: string, content: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow pop-ups to generate PDF');
        return;
    }

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.5;
                    color: #1a1a1a;
                    padding: 40px;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #00bcd4;
                }
                .logo {
                    font-size: 32px;
                    margin-bottom: 8px;
                }
                h1 {
                    font-size: 28px;
                    color: #1a1a1a;
                    margin-bottom: 4px;
                }
                .subtitle {
                    color: #666;
                    font-size: 14px;
                }
                .section {
                    margin-bottom: 30px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #e0e0e0;
                }
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                .stat-card {
                    text-align: center;
                    padding: 16px;
                    background: #f5f5f5;
                    border-radius: 8px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #00bcd4;
                }
                .stat-label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                }
                .flight-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 16px;
                }
                .flight-route {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                .flight-cities {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 12px;
                }
                .flight-details {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    font-size: 14px;
                }
                .detail-item {
                    display: flex;
                    flex-direction: column;
                }
                .detail-label {
                    font-size: 11px;
                    color: #999;
                    text-transform: uppercase;
                }
                .detail-value {
                    color: #333;
                }
                .footer {
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                }
                @media print {
                    body {
                        padding: 20px;
                    }
                    .no-print {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            ${content}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
}

/**
 * Generates a PDF for a single flight
 * 
 * @param flight - The flight to generate PDF for
 */
export function generateFlightPDF(flight: Flight): void {
    const emissions = calculateFlightEmissions(
        flight.distance || 0,
        flight.seatClass,
        flight.aircraftType
    );

    const content = `
        <div class="header">
            <div class="logo">✈️</div>
            <h1>Flight Report</h1>
            <div class="subtitle">Generated by SkyLog</div>
        </div>

        <div class="section">
            <div class="flight-card">
                <div class="flight-route">
                    ${flight.originAirport.iata} → ${flight.destinationAirport.iata}
                </div>
                <div class="flight-cities">
                    ${flight.originAirport.city}, ${flight.originAirport.country} → 
                    ${flight.destinationAirport.city}, ${flight.destinationAirport.country}
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${formatDistance(flight.distance || 0)}</div>
                        <div class="stat-label">Distance</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatDuration(flight.duration || 0)}</div>
                        <div class="stat-label">Duration</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatEmissions(emissions)}</div>
                        <div class="stat-label">CO₂</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${formatDate(flight.date)}</div>
                        <div class="stat-label">Date</div>
                    </div>
                </div>

                <div class="flight-details">
                    <div class="detail-item">
                        <span class="detail-label">Airline</span>
                        <span class="detail-value">${flight.airline}</span>
                    </div>
                    ${flight.flightNumber ? `
                        <div class="detail-item">
                            <span class="detail-label">Flight Number</span>
                            <span class="detail-value">${flight.flightNumber}</span>
                        </div>
                    ` : ''}
                    ${flight.aircraftType ? `
                        <div class="detail-item">
                            <span class="detail-label">Aircraft</span>
                            <span class="detail-value">${flight.aircraftType}</span>
                        </div>
                    ` : ''}
                    ${flight.seatClass ? `
                        <div class="detail-item">
                            <span class="detail-label">Class</span>
                            <span class="detail-value">${flight.seatClass}</span>
                        </div>
                    ` : ''}
                    ${flight.seatNumber ? `
                        <div class="detail-item">
                            <span class="detail-label">Seat</span>
                            <span class="detail-value">${flight.seatNumber}</span>
                        </div>
                    ` : ''}
                </div>

                ${flight.notes ? `
                    <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
                        <div class="detail-label">Notes</div>
                        <p style="color: #666; font-size: 14px; margin-top: 4px;">${flight.notes}</p>
                    </div>
                ` : ''}
            </div>
        </div>

        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
            <p>SkyLog - Your Personal Flight Tracker</p>
        </div>
    `;

    const title = `Flight ${flight.originAirport.iata}-${flight.destinationAirport.iata} - ${formatDate(flight.date)}`;
    openPrintWindow(title, content);
}

/**
 * Generates a PDF for a trip with multiple flights
 * 
 * @param trip - The trip
 * @param flights - Flights belonging to the trip
 */
export function generateTripPDF(trip: Trip, flights: Flight[]): void {
    // Calculate trip statistics
    const totalDistance = flights.reduce((sum, f) => sum + (f.distance || 0), 0);
    const totalDuration = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
    const totalEmissions = flights.reduce((sum, f) => 
        sum + calculateFlightEmissions(f.distance || 0, f.seatClass, f.aircraftType), 0);
    const countries = new Set([
        ...flights.map(f => f.originAirport.country),
        ...flights.map(f => f.destinationAirport.country),
    ]);

    // Sort flights by date
    const sortedFlights = [...flights].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const formatDateRange = () => {
        const start = new Date(trip.startDate);
        const end = new Date(trip.endDate);
        const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    const flightCards = sortedFlights.map((flight, index) => `
        <div class="flight-card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="font-weight: bold; color: #00bcd4; margin-bottom: 4px;">
                        Flight ${index + 1}
                    </div>
                    <div class="flight-route">
                        ${flight.originAirport.iata} → ${flight.destinationAirport.iata}
                    </div>
                    <div class="flight-cities">
                        ${flight.originAirport.city} → ${flight.destinationAirport.city}
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold;">${flight.airline}</div>
                    <div style="color: #666; font-size: 14px;">${formatDate(flight.date)}</div>
                </div>
            </div>
            <div class="flight-details" style="margin-top: 12px;">
                <div class="detail-item">
                    <span class="detail-label">Distance</span>
                    <span class="detail-value">${formatDistance(flight.distance || 0)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Duration</span>
                    <span class="detail-value">${formatDuration(flight.duration || 0)}</span>
                </div>
                ${flight.seatClass ? `
                    <div class="detail-item">
                        <span class="detail-label">Class</span>
                        <span class="detail-value">${flight.seatClass}</span>
                    </div>
                ` : ''}
                ${flight.aircraftType ? `
                    <div class="detail-item">
                        <span class="detail-label">Aircraft</span>
                        <span class="detail-value">${flight.aircraftType}</span>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    const content = `
        <div class="header">
            <div class="logo">🗺️</div>
            <h1>${trip.name}</h1>
            <div class="subtitle">${formatDateRange()}</div>
        </div>

        ${trip.description ? `
            <div class="section">
                <p style="color: #666; text-align: center; font-style: italic;">
                    "${trip.description}"
                </p>
            </div>
        ` : ''}

        <div class="section">
            <div class="section-title">Trip Statistics</div>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${flights.length}</div>
                    <div class="stat-label">Flights</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${countries.size}</div>
                    <div class="stat-label">Countries</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatDistance(totalDistance)}</div>
                    <div class="stat-label">Total Distance</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatDuration(totalDuration)}</div>
                    <div class="stat-label">Flight Time</div>
                </div>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px;">
                Total CO₂ Emissions: <strong>${formatEmissions(totalEmissions)}</strong>
            </div>
        </div>

        <div class="section">
            <div class="section-title">Flight Itinerary</div>
            ${flightCards}
        </div>

        ${trip.tags && trip.tags.length > 0 ? `
            <div class="section">
                <div class="section-title">Tags</div>
                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    ${trip.tags.map(tag => `
                        <span style="padding: 4px 12px; background: #e0f7fa; color: #00838f; border-radius: 16px; font-size: 12px;">
                            ${tag}
                        </span>
                    `).join('')}
                </div>
            </div>
        ` : ''}

        <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</p>
            <p>SkyLog - Your Personal Flight Tracker</p>
        </div>
    `;

    openPrintWindow(`${trip.name} - Trip Report`, content);
}

