/**
 * Monitor Complex - HyperLink Aggregator & Bookmarks Hub
 * Manages categorized links, real-time search, auto-favicons, clicks telemetry, and JSON import/export.
 */

class LinkAggregator {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.links = [];
        this.activeCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'default'; // 'default', 'clicks', 'az', 'recent'

        this.categories = [
            { id: 'all', label: 'All Links', icon: 'grid' },
            { id: 'favorites', label: '⭐ Starred', icon: 'star' },
            { id: 'dev', label: 'Development', icon: 'code' },
            { id: 'network', label: 'Network & Diagnostics', icon: 'activity' },
            { id: 'weather', label: 'Meteorology', icon: 'cloud' },
            { id: 'cloud', label: 'Cloud & Productivity', icon: 'cpu' },
            { id: 'news', label: 'Tech & Intel', icon: 'radio' }
        ];

        this.init();
    }

    init() {
        const saved = localStorage.getItem('mc_links');
        if (saved) {
            try {
                this.links = JSON.parse(saved);
            } catch (e) {
                this.links = this.getDefaultLinks();
            }
        } else {
            this.links = this.getDefaultLinks();
            this.save();
        }
    }

    getDefaultLinks() {
        return [
            // Network & Diagnostics
            {
                id: 'link-1',
                title: 'Cloudflare Radar',
                url: 'https://radar.cloudflare.com',
                category: 'network',
                tags: ['network', 'security', 'cdn', 'global'],
                description: 'Global internet traffic, security attacks, and outage monitoring.',
                clicks: 14,
                isFavorite: true,
                createdAt: Date.now() - 50000000
            },
            {
                id: 'link-2',
                title: 'DownDetector',
                url: 'https://downdetector.com',
                category: 'network',
                tags: ['status', 'outages', 'uptime'],
                description: 'Real-time overview of issues and outages with all kinds of services.',
                clicks: 8,
                isFavorite: false,
                createdAt: Date.now() - 48000000
            },
            {
                id: 'link-3',
                title: 'Fast.com',
                url: 'https://fast.com',
                category: 'network',
                tags: ['speed', 'netflix', 'bandwidth'],
                description: 'Simple, quick internet speed test powered by Netflix servers.',
                clicks: 5,
                isFavorite: false,
                createdAt: Date.now() - 45000000
            },
            {
                id: 'link-4',
                title: 'DNS Checker',
                url: 'https://dnschecker.org',
                category: 'network',
                tags: ['dns', 'propagation', 'domain'],
                description: 'Global DNS propagation checker with multi-region servers.',
                clicks: 11,
                isFavorite: true,
                createdAt: Date.now() - 43000000
            },

            // Development
            {
                id: 'link-5',
                title: 'GitHub',
                url: 'https://github.com',
                category: 'dev',
                tags: ['git', 'code', 'repo', 'open-source'],
                description: 'Where the world builds software, hosts repositories, and collaborates.',
                clicks: 42,
                isFavorite: true,
                createdAt: Date.now() - 90000000
            },
            {
                id: 'link-6',
                title: 'MDN Web Docs',
                url: 'https://developer.mozilla.org',
                category: 'dev',
                tags: ['docs', 'html', 'css', 'javascript'],
                description: 'Resources for developers, by developers. The definitive web reference.',
                clicks: 29,
                isFavorite: true,
                createdAt: Date.now() - 85000000
            },
            {
                id: 'link-7',
                title: 'Stack Overflow',
                url: 'https://stackoverflow.com',
                category: 'dev',
                tags: ['questions', 'community', 'debug'],
                description: 'Developer community sharing knowledge and solving code problems.',
                clicks: 19,
                isFavorite: false,
                createdAt: Date.now() - 80000000
            },
            {
                id: 'link-8',
                title: 'DevDocs.io',
                url: 'https://devdocs.io',
                category: 'dev',
                tags: ['documentation', 'offline', 'api'],
                description: 'Fast, offline-capable API documentation browser in a single clean UI.',
                clicks: 15,
                isFavorite: false,
                createdAt: Date.now() - 75000000
            },

            // Cloud & Productivity
            {
                id: 'link-9',
                title: 'Vercel Dashboard',
                url: 'https://vercel.com/dashboard',
                category: 'cloud',
                tags: ['deploy', 'frontend', 'serverless'],
                description: 'Deploy frontend apps and serverless backends at the edge.',
                clicks: 22,
                isFavorite: true,
                createdAt: Date.now() - 65000000
            },
            {
                id: 'link-10',
                title: 'Figma',
                url: 'https://figma.com',
                category: 'cloud',
                tags: ['design', 'ui', 'prototyping'],
                description: 'Collaborative interface design tool for modern product teams.',
                clicks: 18,
                isFavorite: false,
                createdAt: Date.now() - 60000000
            },
            {
                id: 'link-11',
                title: 'Claude AI',
                url: 'https://claude.ai',
                category: 'cloud',
                tags: ['ai', 'assistant', 'anthropic'],
                description: 'Next-generation AI assistant built by Anthropic.',
                clicks: 35,
                isFavorite: true,
                createdAt: Date.now() - 55000000
            },

            // Meteorology
            {
                id: 'link-12',
                title: 'Windy.com',
                url: 'https://windy.com',
                category: 'weather',
                tags: ['radar', 'wind', 'satellite', 'atmosphere'],
                description: 'Interactive animated wind and storm radar forecast map.',
                clicks: 16,
                isFavorite: true,
                createdAt: Date.now() - 40000000
            },
            {
                id: 'link-13',
                title: 'Open-Meteo',
                url: 'https://open-meteo.com',
                category: 'weather',
                tags: ['api', 'forecast', 'open-data'],
                description: 'Free open-source weather API for non-commercial & commercial use.',
                clicks: 12,
                isFavorite: false,
                createdAt: Date.now() - 35000000
            },
            {
                id: 'link-14',
                title: 'Earth Nullschool',
                url: 'https://earth.nullschool.net',
                category: 'weather',
                tags: ['globe', 'atmosphere', 'ocean'],
                description: 'Real-time 3D interactive globe visualization of atmospheric winds.',
                clicks: 7,
                isFavorite: false,
                createdAt: Date.now() - 30000000
            },

            // News & Intel
            {
                id: 'link-15',
                title: 'Hacker News',
                url: 'https://news.ycombinator.com',
                category: 'news',
                tags: ['tech', 'startups', 'y-combinator'],
                description: 'Curated developer discussions, startup breakthroughs, and computing.',
                clicks: 38,
                isFavorite: true,
                createdAt: Date.now() - 95000000
            },
            {
                id: 'link-16',
                title: 'Ars Technica',
                url: 'https://arstechnica.com',
                category: 'news',
                tags: ['science', 'tech', 'security'],
                description: 'In-depth reporting on technology, policy, science, and digital culture.',
                clicks: 9,
                isFavorite: false,
                createdAt: Date.now() - 92000000
            },
            {
                id: 'link-17',
                title: 'Product Hunt',
                url: 'https://producthunt.com',
                category: 'news',
                tags: ['products', 'launches', 'startups'],
                description: 'The place to discover your next favorite product launch daily.',
                clicks: 13,
                isFavorite: false,
                createdAt: Date.now() - 88000000
            }
        ];
    }

    save() {
        try {
            localStorage.setItem('mc_links', JSON.stringify(this.links));
            if (this.callbacks.onUpdate) {
                this.callbacks.onUpdate(this.getFilteredLinks());
            }
        } catch (e) {
            console.error('Failed to save links:', e);
        }
    }

    getFaviconUrl(url) {
        try {
            const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
            return `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
        } catch (e) {
            return '';
        }
    }

    getDomain(url) {
        try {
            const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
            return parsed.hostname.replace('www.', '');
        } catch (e) {
            return url;
        }
    }

    addLink(linkData) {
        let cleanUrl = linkData.url.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }

        const newLink = {
            id: 'link-' + Date.now(),
            title: linkData.title.trim() || this.getDomain(cleanUrl),
            url: cleanUrl,
            category: linkData.category || 'dev',
            tags: linkData.tags ? linkData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
            description: linkData.description ? linkData.description.trim() : '',
            customIcon: linkData.customIcon || '',
            clicks: 0,
            isFavorite: !!linkData.isFavorite,
            createdAt: Date.now()
        };

        this.links.unshift(newLink);
        this.save();
        return newLink;
    }

    updateLink(id, updatedData) {
        const idx = this.links.findIndex(l => l.id === id);
        if (idx !== -1) {
            let cleanUrl = updatedData.url.trim();
            if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
                cleanUrl = 'https://' + cleanUrl;
            }

            this.links[idx] = {
                ...this.links[idx],
                title: updatedData.title.trim() || this.getDomain(cleanUrl),
                url: cleanUrl,
                category: updatedData.category || this.links[idx].category,
                tags: Array.isArray(updatedData.tags) ? updatedData.tags : (updatedData.tags ? updatedData.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []),
                description: updatedData.description ? updatedData.description.trim() : '',
                customIcon: updatedData.customIcon || ''
            };
            this.save();
        }
    }

    deleteLink(id) {
        this.links = this.links.filter(l => l.id !== id);
        this.save();
    }

    toggleFavorite(id) {
        const link = this.links.find(l => l.id === id);
        if (link) {
            link.isFavorite = !link.isFavorite;
            this.save();
            return link.isFavorite;
        }
        return false;
    }

    recordClick(id) {
        const link = this.links.find(l => l.id === id);
        if (link) {
            link.clicks = (link.clicks || 0) + 1;
            this.save();
        }
    }

    setCategory(categoryId) {
        this.activeCategory = categoryId;
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.getFilteredLinks());
        }
    }

    setSearch(query) {
        this.searchQuery = (query || '').toLowerCase().trim();
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.getFilteredLinks());
        }
    }

    setSort(sortType) {
        this.sortBy = sortType;
        if (this.callbacks.onUpdate) {
            this.callbacks.onUpdate(this.getFilteredLinks());
        }
    }

    getFilteredLinks() {
        let list = [...this.links];

        // Filter category
        if (this.activeCategory === 'favorites') {
            list = list.filter(l => l.isFavorite);
        } else if (this.activeCategory !== 'all') {
            list = list.filter(l => l.category === this.activeCategory);
        }

        // Search query
        if (this.searchQuery) {
            const q = this.searchQuery;
            list = list.filter(l => {
                const titleMatch = l.title.toLowerCase().includes(q);
                const urlMatch = l.url.toLowerCase().includes(q);
                const descMatch = (l.description || '').toLowerCase().includes(q);
                const tagMatch = (l.tags || []).some(t => t.toLowerCase().includes(q));
                return titleMatch || urlMatch || descMatch || tagMatch;
            });
        }

        // Sorting
        if (this.sortBy === 'clicks') {
            list.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
        } else if (this.sortBy === 'az') {
            list.sort((a, b) => a.title.localeCompare(b.title));
        } else if (this.sortBy === 'recent') {
            list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        }

        return list;
    }

    exportJSON() {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.links, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `monitor-complex-links-${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    importJSON(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            if (Array.isArray(imported)) {
                // merge or replace
                const idMap = new Set(this.links.map(l => l.url.toLowerCase()));
                let added = 0;
                imported.forEach(item => {
                    if (item.url && !idMap.has(item.url.toLowerCase())) {
                        this.links.push({
                            id: 'link-' + Date.now() + Math.floor(Math.random() * 1000),
                            title: item.title || item.url,
                            url: item.url,
                            category: item.category || 'dev',
                            tags: Array.isArray(item.tags) ? item.tags : [],
                            description: item.description || '',
                            clicks: item.clicks || 0,
                            isFavorite: !!item.isFavorite,
                            createdAt: item.createdAt || Date.now()
                        });
                        idMap.add(item.url.toLowerCase());
                        added++;
                    }
                });
                this.save();
                return { success: true, count: added };
            }
            return { success: false, error: 'Invalid JSON format' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }

    resetDefaults() {
        this.links = this.getDefaultLinks();
        this.save();
    }
}

window.LinkAggregator = LinkAggregator;
