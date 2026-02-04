// scripts/generate-msn.js
const fs = require("fs")
const path = require("path")

const USERNAME = process.env.GITHUB_REPOSITORY_OWNER || "YourUsername"
const TOKEN = process.env.GH_TOKEN

async function fetchGitHub(endpoint) {
	const headers = { "User-Agent": "MSN-Readme-Bot" }
	if (TOKEN) headers["Authorization"] = `token ${TOKEN}`

	const res = await fetch(`https://api.github.com${endpoint}`, { headers })
	return res.json()
}

async function generateMSN() {
	console.log(`Fetching data for ${USERNAME}...`)

	const user = await fetchGitHub(`/users/${USERNAME}`)
	const events = await fetchGitHub(`/users/${USERNAME}/events?per_page=1`)
	const followers = await fetchGitHub(`/users/${USERNAME}/followers?per_page=3`)
	const following = await fetchGitHub(`/users/${USERNAME}/following?per_page=3`)

	// Calculate online status based on recent activity
	const lastActive = events[0] ? new Date(events[0].created_at) : null
	const hoursSinceActive = lastActive
		? (Date.now() - lastActive) / (1000 * 60 * 60)
		: 999

	let status, statusColor
	if (hoursSinceActive < 1) {
		status = "Online"
		statusColor = "#00AA00"
	} else if (hoursSinceActive < 24) {
		status = "Away"
		statusColor = "#FFA500"
	} else {
		status = "Offline"
		statusColor = "#888888"
	}

	// Build online contacts (people you follow)
	const onlineContacts = following
		.slice(0, 3)
		.map((f, i) => {
			const yPos = 213 + i * 18
			const isAway = i % 2 === 1
			return `
      <g>
        <g transform="translate(24, ${yPos - 8})">
          <rect x="0" y="0" width="12" height="12" fill="${isAway ? "#FFA500" : "#00AA00"}" rx="1"/>
          <rect x="2" y="2" width="3" height="8" fill="#fff"/>
          <rect x="5" y="4" width="3" height="4" fill="#fff"/>
        </g>
        <text x="42" y="${yPos}" font-family="Tahoma, sans-serif" font-size="11" fill="#000">
          ${escapeXml(truncate(f.login, 18))}${isAway ? " (Away)" : ""}
        </text>
      </g>`
		})
		.join("")

	// Build offline contacts (followers)
	const offlineContacts = followers
		.slice(0, 2)
		.map((f, i) => {
			const yPos = 295 + i * 18
			return `
      <text x="42" y="${yPos}" font-family="Tahoma, sans-serif" font-size="11" fill="#000">
        ~*${escapeXml(truncate(f.login, 14))}*~
      </text>`
		})
		.join("")

	const svg = `<svg width="218" height="428" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Title bar gradient - classic Windows XP blue -->
    <linearGradient id="titlebarShine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#3C81E5"/>
      <stop offset="50%" style="stop-color:#2E6CD1"/>
      <stop offset="100%" style="stop-color:#1D4FA0"/>
    </linearGradient>
    
    <!-- Bottom panel gradient -->
    <linearGradient id="bottomPanel" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#D6DFF7"/>
      <stop offset="100%" style="stop-color:#C3CCE0"/>
    </linearGradient>
    
    <!-- Window background gradient -->
    <linearGradient id="windowBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#D4E4FF"/>
      <stop offset="100%" style="stop-color:#C0D8FF"/>
    </linearGradient>
    
    <!-- ============================================ -->
    <!-- MSN BUDDY ICON GRADIENTS - 3D EFFECT -->
    <!-- ============================================ -->
    
    <!-- BACK FIGURE (Blue/Teal) - Head -->
    <radialGradient id="backHead" cx="35%" cy="25%" r="60%" fx="30%" fy="20%">
      <stop offset="0%" style="stop-color:#7BCBCF"/>
      <stop offset="40%" style="stop-color:#3A98A0"/>
      <stop offset="70%" style="stop-color:#2B7A8A"/>
      <stop offset="100%" style="stop-color:#1A5066"/>
    </radialGradient>
    
    <!-- BACK FIGURE (Blue/Teal) - Body -->
    <radialGradient id="backBody" cx="40%" cy="20%" r="70%" fx="35%" fy="15%">
      <stop offset="0%" style="stop-color:#6ABFC5"/>
      <stop offset="30%" style="stop-color:#3A9BA5"/>
      <stop offset="60%" style="stop-color:#2A7585"/>
      <stop offset="100%" style="stop-color:#1A4A5A"/>
    </radialGradient>
    
    <!-- FRONT FIGURE (Green/Yellow) - Head -->
    <radialGradient id="frontHead" cx="30%" cy="25%" r="65%" fx="25%" fy="20%">
      <stop offset="0%" style="stop-color:#E8EFC0"/>
      <stop offset="20%" style="stop-color:#C5D99A"/>
      <stop offset="50%" style="stop-color:#8AB878"/>
      <stop offset="80%" style="stop-color:#5A9A6A"/>
      <stop offset="100%" style="stop-color:#3A7A5A"/>
    </radialGradient>
    
    <!-- FRONT FIGURE (Green/Yellow) - Body -->
    <radialGradient id="frontBody" cx="35%" cy="15%" r="75%" fx="30%" fy="10%">
      <stop offset="0%" style="stop-color:#D8E8B0"/>
      <stop offset="25%" style="stop-color:#A8C888"/>
      <stop offset="55%" style="stop-color:#78A878"/>
      <stop offset="85%" style="stop-color:#4A8868"/>
      <stop offset="100%" style="stop-color:#2A6850"/>
    </radialGradient>
    
    <!-- Highlight overlays for 3D shine -->
    <radialGradient id="headShine" cx="30%" cy="20%" r="50%" fx="25%" fy="15%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.6)"/>
      <stop offset="100%" style="stop-color:rgba(255,255,255,0)"/>
    </radialGradient>
    
    <!-- ============================================ -->
    <!-- MSN BUTTERFLY GRADIENTS -->
    <!-- ============================================ -->
    
    <!-- Blue wing (top left) -->
    <radialGradient id="wingBlue" cx="60%" cy="70%" r="60%">
      <stop offset="0%" style="stop-color:#4AB8E8"/>
      <stop offset="100%" style="stop-color:#2070A0"/>
    </radialGradient>
    
    <!-- Green wing (bottom left) -->
    <radialGradient id="wingGreen" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#8BD048"/>
      <stop offset="100%" style="stop-color:#3A9028"/>
    </radialGradient>
    
    <!-- Orange wing (top right) -->
    <radialGradient id="wingOrange" cx="40%" cy="70%" r="60%">
      <stop offset="0%" style="stop-color:#F89840"/>
      <stop offset="100%" style="stop-color:#E05820"/>
    </radialGradient>
    
    <!-- Yellow wing (bottom right) -->
    <radialGradient id="wingYellow" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#FFD848"/>
      <stop offset="100%" style="stop-color:#E8A820"/>
    </radialGradient>
    
    <!-- Drop shadow filter -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  
  <!-- Window outer frame -->
  <rect width="218" height="428" fill="#0A246A" rx="6"/>
  
  <!-- Title bar -->
  <rect x="1" y="1" width="216" height="22" fill="url(#titlebarShine)" rx="5"/>
  <rect x="1" y="18" width="216" height="5" fill="#1D4FA0"/>
  
  <!-- Title bar icon (small MSN icon) -->
  <g transform="translate(5, 5)">
    <circle cx="6" cy="6" r="4" fill="#4AC94A"/>
    <circle cx="10" cy="8" r="4" fill="#4A90C9"/>
  </g>
  
  <!-- Title text -->
  <text x="22" y="15" font-family="Tahoma, sans-serif" font-size="11" fill="#FFFFFF" font-weight="bold">
    MSN Messenger
  </text>
  
  <!-- Window controls -->
  <g transform="translate(158, 4)">
    <rect x="0" y="0" width="17" height="14" fill="#1D4FA0" stroke="#3C81E5" stroke-width="1" rx="2"/>
    <line x1="4" y1="10" x2="12" y2="10" stroke="#fff" stroke-width="2"/>
    
    <rect x="19" y="0" width="17" height="14" fill="#1D4FA0" stroke="#3C81E5" stroke-width="1" rx="2"/>
    <rect x="23" y="3" width="9" height="8" fill="none" stroke="#fff" stroke-width="1.5"/>
    
    <rect x="38" y="0" width="17" height="14" fill="#C94A4A" stroke="#E57373" stroke-width="1" rx="2"/>
    <line x1="42" y1="3" x2="51" y2="11" stroke="#fff" stroke-width="2"/>
    <line x1="51" y1="3" x2="42" y2="11" stroke="#fff" stroke-width="2"/>
  </g>
  
  <!-- Menu bar -->
  <rect x="1" y="23" width="216" height="18" fill="#D4E4FF"/>
  <text x="8" y="36" font-family="Tahoma, sans-serif" font-size="11" fill="#000">
    <tspan>File</tspan>
    <tspan dx="12">Actions</tspan>
    <tspan dx="12">Tools</tspan>
    <tspan dx="12">Help</tspan>
  </text>
  <line x1="1" y1="41" x2="217" y2="41" stroke="#9DB9D9" stroke-width="1"/>
  
  <!-- Main window area -->
  <rect x="1" y="42" width="216" height="384" fill="url(#windowBg)"/>
  
  <!-- User info section background -->
  <rect x="6" y="47" width="206" height="68" fill="#C8DCF8" rx="3"/>
  
  <!-- ============================================ -->
  <!-- MSN BUDDY ICON - 3D TWO-PERSON SILHOUETTE -->
  <!-- ============================================ -->
  <g transform="translate(14, 52)">
    <!-- Container box -->
    <rect x="0" y="0" width="52" height="50" fill="#B8CCE8" stroke="#8CAAD4" stroke-width="1" rx="3"/>
    
    <!-- Buddy figures group - scaled to fit box -->
    <g transform="translate(4, 3) scale(0.42)" filter="url(#dropShadow)">
      
      <!-- BACK FIGURE (Blue/Teal person - right side) -->
      <g transform="translate(42, 8)">
        <!-- Body (torso) - drawn first so head overlaps -->
        <ellipse cx="26" cy="68" rx="30" ry="28" fill="url(#backBody)"/>
        <!-- Arm hint on right -->
        <ellipse cx="52" cy="72" rx="10" ry="14" fill="url(#backBody)"/>
        
        <!-- Head -->
        <circle cx="26" cy="24" r="22" fill="url(#backHead)"/>
        <!-- Head highlight/shine -->
        <ellipse cx="18" cy="16" rx="10" ry="8" fill="url(#headShine)" opacity="0.5"/>
      </g>
      
      <!-- FRONT FIGURE (Green/Yellow person - left side) -->
      <g transform="translate(0, 18)">
        <!-- Body (torso) -->
        <ellipse cx="28" cy="68" rx="32" ry="30" fill="url(#frontBody)"/>
        <!-- Left arm hint -->
        <ellipse cx="-2" cy="68" rx="10" ry="16" fill="url(#frontBody)"/>
        
        <!-- Head -->
        <circle cx="28" cy="22" r="24" fill="url(#frontHead)"/>
        <!-- Head highlight/shine -->
        <ellipse cx="18" cy="12" rx="12" ry="10" fill="url(#headShine)" opacity="0.6"/>
      </g>
      
      <!-- MSN BUTTERFLY - positioned at bottom left -->
      <g transform="translate(-8, 62) scale(0.55)">
        <!-- Blue wing (top left) -->
        <ellipse cx="18" cy="22" rx="16" ry="24" fill="url(#wingBlue)" transform="rotate(-30, 18, 22)"/>
        
        <!-- Green wing (bottom left) -->
        <ellipse cx="22" cy="58" rx="14" ry="20" fill="url(#wingGreen)" transform="rotate(-20, 22, 58)"/>
        
        <!-- Orange wing (top right) -->
        <ellipse cx="52" cy="20" rx="18" ry="26" fill="url(#wingOrange)" transform="rotate(25, 52, 20)"/>
        
        <!-- Yellow wing (bottom right) -->
        <ellipse cx="50" cy="60" rx="15" ry="22" fill="url(#wingYellow)" transform="rotate(15, 50, 60)"/>
        
        <!-- Butterfly body (center) -->
        <ellipse cx="35" cy="40" rx="6" ry="20" fill="#5566AA"/>
        
        <!-- Body highlight -->
        <ellipse cx="33" cy="35" rx="3" ry="12" fill="rgba(255,255,255,0.3)"/>
      </g>
    </g>
  </g>
  
  <!-- My Status label and username -->
  <text x="74" y="62" font-family="Tahoma, sans-serif" font-size="10" fill="#666666">My Status:</text>
  
  <!-- Online status dropdown appearance -->
  <g transform="translate(74, 66)">
    <text x="0" y="12" font-family="Tahoma, sans-serif" font-size="12" fill="#000" font-weight="bold">
      ${escapeXml(truncate(user.name || user.login, 14))}
    </text>
    <text x="${Math.min((user.name || user.login).length * 7, 98)}" y="12" font-family="Tahoma, sans-serif" font-size="11" fill="#008000"> (${status})</text>
  </g>
  
  <!-- Email notification box -->
  <g transform="translate(6, 120)">
    <rect x="0" y="0" width="206" height="24" fill="#FFFFFF" stroke="#7B9BC9" stroke-width="1" rx="2"/>
    
    <!-- Mini MSN Butterfly icon -->
    <g transform="translate(4, 2) scale(0.35)">
      <ellipse cx="12" cy="12" rx="10" ry="14" fill="#4AB8E8" transform="rotate(-20, 12, 12)"/>
      <ellipse cx="14" cy="38" rx="8" ry="12" fill="#8BD048" transform="rotate(-10, 14, 38)"/>
      <ellipse cx="38" cy="10" rx="12" ry="16" fill="#F89840" transform="rotate(20, 38, 10)"/>
      <ellipse cx="36" cy="40" rx="10" ry="14" fill="#FFD848" transform="rotate(10, 36, 40)"/>
      <ellipse cx="25" cy="25" rx="4" ry="14" fill="#5566AA"/>
    </g>
    
    <text x="26" y="16" font-family="Tahoma, sans-serif" font-size="10" fill="#0066CC" text-decoration="underline">
      ${user.public_repos} repositories · ${user.followers} followers
    </text>
  </g>
  
  <!-- Separator line -->
  <line x1="6" y1="152" x2="212" y2="152" stroke="#9DB9D9" stroke-width="1"/>
  
  <!-- Contact List Area -->
  <rect x="6" y="156" width="206" height="176" fill="#FFFFFF" stroke="#7B9BC9" stroke-width="1"/>
  
  <!-- Online section header -->
  <g transform="translate(10, 170)">
    <polygon points="0,0 8,4 0,8" fill="#333"/>
    <text x="14" y="7" font-family="Tahoma, sans-serif" font-size="11" fill="#000" font-weight="bold">
      Online (${Math.min(following.length, 3)})
    </text>
  </g>
  
  <!-- Online contacts -->
  ${onlineContacts}
  
  <!-- Not Online section header -->
  <g transform="translate(10, 263)">
    <polygon points="0,0 8,4 0,8" fill="#333"/>
    <text x="14" y="7" font-family="Tahoma, sans-serif" font-size="11" fill="#000" font-weight="bold">
      Not Online (${Math.min(followers.length, 2)})
    </text>
  </g>
  
  <!-- Offline contacts -->
  ${offlineContacts}
  
  <!-- "I want to..." section -->
  <rect x="1" y="336" width="216" height="90" fill="url(#bottomPanel)"/>
  <line x1="1" y1="336" x2="217" y2="336" stroke="#9DB9D9" stroke-width="1"/>
  
  <g transform="translate(8, 350)">
    <polygon points="0,0 8,4 0,8" fill="#2D6BBF"/>
    <text x="14" y="7" font-family="Tahoma, sans-serif" font-size="11" fill="#000" font-weight="bold">
      I want to...
    </text>
  </g>
  
  <!-- Action links with icons -->
  <g transform="translate(16, 364)">
    <g transform="translate(0, 0)">
      <circle cx="6" cy="6" r="5" fill="#6BB34A" stroke="#4A8532" stroke-width="1"/>
      <text x="4" y="9" font-family="Arial" font-size="8" fill="#fff" font-weight="bold">+</text>
      <text x="16" y="10" font-family="Tahoma, sans-serif" font-size="11" fill="#0066CC">Add a Contact</text>
    </g>
    
    <g transform="translate(0, 16)">
      <rect x="1" y="1" width="10" height="8" fill="#FFE566" stroke="#CCA300" stroke-width="1" rx="1"/>
      <line x1="1" y1="1" x2="6" y2="5" stroke="#CCA300" stroke-width="1"/>
      <line x1="11" y1="1" x2="6" y2="5" stroke="#CCA300" stroke-width="1"/>
      <text x="16" y="10" font-family="Tahoma, sans-serif" font-size="11" fill="#0066CC">Send an Instant Message</text>
    </g>
    
    <g transform="translate(0, 32)">
      <rect x="2" y="0" width="9" height="11" fill="#F5F5DC" stroke="#999" stroke-width="1"/>
      <polyline points="7,0 7,3 11,3" fill="none" stroke="#999" stroke-width="1"/>
      <text x="16" y="10" font-family="Tahoma, sans-serif" font-size="11" fill="#0066CC">Send a File or Photo</text>
    </g>
    
    <text x="0" y="58" font-family="Tahoma, sans-serif" font-size="11" fill="#0066CC" font-weight="bold">More</text>
  </g>
  
  <!-- Bottom MSN branding -->
  <g transform="translate(40, 406)">
    <!-- MSN Butterfly -->
    <g transform="scale(0.32)">
      <ellipse cx="12" cy="12" rx="10" ry="14" fill="#4AB8E8" transform="rotate(-20, 12, 12)"/>
      <ellipse cx="14" cy="38" rx="8" ry="12" fill="#8BD048" transform="rotate(-10, 14, 38)"/>
      <ellipse cx="38" cy="10" rx="12" ry="16" fill="#F89840" transform="rotate(20, 38, 10)"/>
      <ellipse cx="36" cy="40" rx="10" ry="14" fill="#FFD848" transform="rotate(10, 36, 40)"/>
      <ellipse cx="25" cy="25" rx="4" ry="14" fill="#5566AA"/>
    </g>
    <text x="22" y="14" font-family="Arial, sans-serif" font-size="14" fill="#333" font-style="italic" font-weight="bold">
      msn
    </text>
    <text x="48" y="14" font-family="Times New Roman, serif" font-size="14" fill="#333">
      Messenger
    </text>
  </g>
  
  <!-- Window border -->
  <rect x="0" y="0" width="218" height="428" fill="none" stroke="#0A246A" stroke-width="2" rx="6"/>
</svg>`

	// Ensure assets directory exists
	const assetsDir = path.join(process.cwd(), "assets")
	if (!fs.existsSync(assetsDir)) {
		fs.mkdirSync(assetsDir, { recursive: true })
	}

	// Write SVG file
	const outputPath = path.join(assetsDir, "msn-messenger.svg")
	fs.writeFileSync(outputPath, svg)
	console.log(`Generated ${outputPath}`)
}

function escapeXml(str) {
	if (!str) return ""
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;")
}

function truncate(str, len) {
	if (!str) return ""
	return str.length > len ? str.substring(0, len - 1) + "…" : str
}

generateMSN().catch(console.error)
