# Mattermost Quote Message Plugin

A simple and efficient Mattermost plugin that allows users to quote messages directly in conversations.

## Features
- Quick quote functionality from post dropdown menu
- Automatic Markdown formatting with author attribution
- Support for non-system messages
- Real-time quote insertion into message composer

## Requirements
- Mattermost v11 or compatible versions
- Go (for server development)
- Node.js and npm (for webapp development)

## Installation

1. Download the latest release from the releases page
2. Upload the plugin through Mattermost System Console
3. Enable the plugin in your Mattermost instance

## Development

To build the plugin:

1. Build server:
```bash
make server
```

2. Build webapp:
```bash
cd webapp
npm install
npm run build
```

3. Package plugin:
```bash
make package
```

The packaged plugin will be available in the `dist/` directory.

## Usage

1. Hover over any message you want to quote
2. Click the four dots menu (⋮)
3. Select "Quote message"
4. The quoted message will appear in your composer with proper formatting

## Contributing

Contributions are welcome! Some areas for improvement:
- Custom formatting options
- Keyboard shortcuts
- Multi-message quoting

## License

This project is licensed under the MIT License - see the LICENSE file for details.
