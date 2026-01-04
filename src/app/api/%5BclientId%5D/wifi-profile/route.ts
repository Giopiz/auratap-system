import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets-server';
import { WifiCredentials } from '@/lib/wifi-service';

export async function GET(
    _request: NextRequest,
    _context: { params: Promise<{ clientId: string }> }
) {
    const { clientId } = await _context.params;

    try {
        const credentials = await fetchSheetData(clientId) as WifiCredentials | null;

        if (!credentials) {
            return new NextResponse('Client not found', { status: 404 });
        }

        const { ssid, password, securityType } = credentials;
        const id = clientId.replace(/[^a-zA-Z0-9]/g, '');
        const uuid1 = crypto.randomUUID();
        const uuid2 = crypto.randomUUID();

        // Map security types for Apple Profile
        // Options: WPA, WEP, Any, None
        let encryption = 'WPA';
        if (securityType === 'WEP') encryption = 'WEP';
        if (securityType === 'nopass') encryption = 'None';

        const profileXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>AutoJoin</key>
            <true/>
            <key>CaptiveBypass</key>
            <false/>
            <key>EncryptionType</key>
            <string>${encryption}</string>
            <key>HIDDEN_NETWORK</key>
            <false/>
            <key>Password</key>
            <string>${password}</string>
            <key>PayloadDescription</key>
            <string>Configures Wi-Fi settings for ${ssid}</string>
            <key>PayloadDisplayName</key>
            <string>Wi-Fi</string>
            <key>PayloadIdentifier</key>
            <string>com.apple.wifi.managed.${id}</string>
            <key>PayloadType</key>
            <string>com.apple.wifi.managed</string>
            <key>PayloadUUID</key>
            <string>${uuid1}</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>SSID_STR</key>
            <string>${ssid}</string>
        </dict>
    </array>
    <key>PayloadDescription</key>
    <string>Auto-connect to AuraTap Wi-Fi</string>
    <key>PayloadDisplayName</key>
    <string>AuraTap Wi-Fi: ${ssid}</string>
    <key>PayloadIdentifier</key>
    <string>com.auratap.wifi.${id}</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>${uuid2}</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

        return new NextResponse(profileXml, {
            headers: {
                'Content-Type': 'application/x-apple-aspen-config',
                'Content-Disposition': `attachment; filename="${clientId}-wifi.mobileconfig"`,
            },
        });

    } catch (error) {
        console.error('[Wifi Profile Error]:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
