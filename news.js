/**
 * Monitor Complex - News Hub & Live Streaming Feeds
 * Real-time global & local news wire, multi-region category filtering, breaking news ticker,
 * and embedded 24/7 free international & regional live video news feeds.
 */

class NewsHubEngine {
    constructor(callbacks) {
        this.callbacks = callbacks || {};
        this.currentFilter = 'all'; // 'all', 'local', 'world', 'tech', 'science', 'business'
        this.searchQuery = '';
        this.userLocation = {
            country: 'Global',
            countryCode: 'US',
            city: 'Worldwide'
        };

        // Current Active Live Video Stream
        this.activeChannelId = 'skynews';

        // 24/7 Free Official International & Regional News Video Feeds
        this.liveChannels = [
            {
                id: 'skynews',
                name: 'Sky News Live',
                country: 'United Kingdom',
                code: 'GB',
                flag: '🇬🇧',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/9Auq9mYxFEE?autoplay=1&mute=0',
                fallbackId: '9Auq9mYxFEE',
                desc: '24/7 breaking international news, live reports, and in-depth analysis from the UK and worldwide.',
                viewers: 'Live • 45K watching'
            },
            {
                id: 'aljazeera',
                name: 'Al Jazeera English',
                country: 'Global / Middle East',
                code: 'QA',
                flag: '🇶🇦',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/gCNeDWCI0vo?autoplay=1&mute=0',
                fallbackId: 'gCNeDWCI0vo',
                desc: 'Independent global news reporting, geopolitical investigations, and human stories from 70+ bureaus.',
                viewers: 'Live • 62K watching'
            },
            {
                id: 'dw',
                name: 'DW News Live',
                country: 'Germany / Europe',
                code: 'DE',
                flag: '🇩🇪',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/lu_Z7fmgc4I?autoplay=1&mute=0',
                fallbackId: 'lu_Z7fmgc4I',
                desc: 'Deutsche Welle international broadcast with European perspectives, politics, and environment.',
                viewers: 'Live • 28K watching'
            },
            {
                id: 'france24',
                name: 'France 24 English',
                country: 'France / Europe',
                code: 'FR',
                flag: '🇫🇷',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/h3MuIUNCCzI?autoplay=1&mute=0',
                fallbackId: 'h3MuIUNCCzI',
                desc: 'Round-the-clock international news channel offering a French perspective on world events.',
                viewers: 'Live • 19K watching'
            },
            {
                id: 'abcnews',
                name: 'ABC News Live',
                country: 'United States',
                code: 'US',
                flag: '🇺🇸',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/w_Ma8oQLmSM?autoplay=1&mute=0',
                fallbackId: 'w_Ma8oQLmSM',
                desc: 'Live breaking news, live event coverage, and premier documentary storytelling from ABC News.',
                viewers: 'Live • 55K watching'
            },
            {
                id: 'euronews',
                name: 'Euronews Live',
                country: 'European Union',
                code: 'EU',
                flag: '🇪🇺',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/pykdAUWi_e4?autoplay=1&mute=0',
                fallbackId: 'pykdAUWi_e4',
                desc: 'Europe’s leading international news channel covering continental economy and culture.',
                viewers: 'Live • 14K watching'
            },
            {
                id: 'nhk',
                name: 'NHK World Japan',
                country: 'Japan / Asia',
                code: 'JP',
                flag: '🇯🇵',
                category: 'world',
                streamUrl: 'https://www.youtube-nocookie.com/embed/f0lYkdA-Gtw?autoplay=1&mute=0',
                fallbackId: 'f0lYkdA-Gtw',
                desc: 'English-language international broadcasting service of NHK covering Asian science, tech and society.',
                viewers: 'Live • 12K watching'
            },
            {
                id: 'nasa',
                name: 'NASA Live Stream',
                country: 'Global / Space',
                code: 'US',
                flag: '🚀',
                category: 'science',
                streamUrl: 'https://www.youtube-nocookie.com/embed/21X5lGlDOfg?autoplay=1&mute=0',
                fallbackId: '21X5lGlDOfg',
                desc: 'Live views of Earth from the International Space Station, rocket launches, and space exploration.',
                viewers: 'Live • 84K watching'
            },
            {
                id: 'bloomberg',
                name: 'Bloomberg Quicktake',
                country: 'Global / Finance',
                code: 'US',
                flag: '📈',
                category: 'business',
                streamUrl: 'https://www.youtube-nocookie.com/embed/dp8PhLsUcFE?autoplay=1&mute=0',
                fallbackId: 'dp8PhLsUcFE',
                desc: 'Global business, markets, technology developments, and leadership conversations.',
                viewers: 'Live • 31K watching'
            },
            {
                id: 'africanews',
                name: 'Africanews Live',
                country: 'Pan-African / Regional',
                code: 'KE',
                flag: '🌍',
                category: 'local',
                streamUrl: 'https://www.youtube-nocookie.com/embed/bL_iPkWnQ2A?autoplay=1&mute=0',
                fallbackId: 'bL_iPkWnQ2A',
                desc: 'Multi-lingual Pan-African news covering East Africa, West Africa, politics, and innovation.',
                viewers: 'Live • 15K watching'
            },
            {
                id: 'citizentv',
                name: 'Citizen TV Kenya',
                country: 'Kenya',
                code: 'KE',
                flag: '🇰🇪',
                category: 'local',
                streamUrl: 'https://www.youtube-nocookie.com/embed/b-TKzwpS2rs?autoplay=1&mute=0',
                fallbackId: 'b-TKzwpS2rs',
                desc: 'Kenya\'s most watched television station — live breaking news, politics, business, and in-depth local coverage from Nairobi and across East Africa.',
                viewers: 'Live • Kenyan Local News'
            }
        ];

        this.articles = [];
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.loadSampleArticles();
        await this.fetchRealTimeArticles();
    }

    setLocation(countryName, countryCode, cityName) {
        if (countryName) this.userLocation.country = countryName;
        if (countryCode) this.userLocation.countryCode = countryCode.toUpperCase();
        if (cityName) this.userLocation.city = cityName;

        // Auto-tag local articles or adapt streams
        this.tagLocalArticles();
        if (this.callbacks.onArticlesUpdated) {
            this.callbacks.onArticlesUpdated(this.getFilteredArticles());
        }
    }

    tagLocalArticles() {
        const country = this.userLocation.country.toLowerCase();
        this.articles.forEach(art => {
            if (art.title.toLowerCase().includes(country) || (art.summary || '').toLowerCase().includes(country)) {
                art.isLocal = true;
                art.category = 'local';
            }
        });
    }

    loadSampleArticles() {
        const now = Date.now();
        const loc = this.userLocation.country || 'Global';

        this.articles = [
            {
                id: 'art-1',
                title: 'Global Satellite Network Reaches 10,000 Next-Gen Broadband Orbiters',
                source: 'Tech Wire Daily',
                category: 'tech',
                url: 'https://www.space.com/news',
                timeAgo: '12m ago',
                isBreaking: true,
                isLocal: false,
                image: 'https://images.unsplash.com/photo-1517976487502-5f795777123c?w=600&auto=format&fit=crop&q=80',
                summary: 'New quantum-laser cross-links between orbital nodes significantly reduce latency for transoceanic communication networks.'
            },
            {
                id: 'art-2',
                title: `Regional Infrastructure Upgrade: ${loc} Expands High-Speed Fiber Backbone`,
                source: 'Regional Telecom Dispatch',
                category: 'local',
                url: 'https://news.google.com',
                timeAgo: '28m ago',
                isBreaking: false,
                isLocal: true,
                image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
                summary: `Massive infrastructure initiative brings gigabit municipal fiber and enhanced 5G cellular coverage to urban and peri-urban hubs across ${loc}.`
            },
            {
                id: 'art-3',
                title: 'UN Climate Summit Adopts Real-Time Atmospheric Monitoring Framework',
                source: 'World Reuters Wire',
                category: 'world',
                url: 'https://www.reuters.com',
                timeAgo: '45m ago',
                isBreaking: true,
                isLocal: false,
                image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
                summary: 'A unified global protocol will provide open meteorological telemetry, tracking ocean currents, polar ice melt, and clean energy adoption.'
            },
            {
                id: 'art-4',
                title: 'Major Breakthrough in Ambient Room-Temperature Superconductors',
                source: 'Science & Physics Review',
                category: 'science',
                url: 'https://www.nature.com',
                timeAgo: '1h ago',
                isBreaking: false,
                isLocal: false,
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
                summary: 'Independent laboratories verify zero electrical resistance in composite materials, paving the way for frictionless magnetic transit.'
            },
            {
                id: 'art-5',
                title: 'Global Tech Index Rallies Following Breakthroughs in Autonomous Edge Computing',
                source: 'Bloomberg Markets',
                category: 'business',
                url: 'https://www.bloomberg.com',
                timeAgo: '1h 30m ago',
                isBreaking: false,
                isLocal: false,
                image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80',
                summary: 'Semiconductor manufacturers report unprecedented demand as edge devices begin running autonomous neural models locally.'
            },
            {
                id: 'art-6',
                title: `Local Renewable Grid Initiative In ${loc} Powers Over 500,000 Homes`,
                source: 'National Clean Energy Post',
                category: 'local',
                url: 'https://news.google.com',
                timeAgo: '2h ago',
                isBreaking: false,
                isLocal: true,
                image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&auto=format&fit=crop&q=80',
                summary: `Massive solar farms and battery storage installations have reached peak grid integration, driving electricity bills down throughout ${loc}.`
            },
            {
                id: 'art-7',
                title: 'Open Source Security Foundation Releases Critical Protocol Patch for Web Core',
                source: 'Cyber Defense Journal',
                category: 'tech',
                url: 'https://news.ycombinator.com',
                timeAgo: '2h 15m ago',
                isBreaking: false,
                isLocal: false,
                image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
                summary: 'Engineers worldwide coordinate to update foundational cryptographic libraries before potential exploits emerge in legacy systems.'
            },
            {
                id: 'art-8',
                title: 'James Webb Telescope Captures Detailed Chemistry of Earth-Sized Exoplanet Atmosphere',
                source: 'NASA Cosmic News',
                category: 'science',
                url: 'https://www.nasa.gov',
                timeAgo: '3h ago',
                isBreaking: false,
                isLocal: false,
                image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop&q=80',
                summary: 'Spectroscopic observations detect water vapor, methane, and carbon dioxide in the habitable zone of star system Trappist-1.'
            }
        ];
    }

    async fetchRealTimeArticles() {
        this.isLoading = true;
        if (this.callbacks.onLoading) this.callbacks.onLoading(true);

        try {
            // Fetch live stories from Spaceflight News API (Live, fast, high-res images)
            const spaceRes = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=8', { signal: AbortSignal.timeout(4000) });
            if (spaceRes.ok) {
                const spaceData = await spaceRes.json();
                if (spaceData.results && spaceData.results.length > 0) {
                    const fetched = spaceData.results.map((art, idx) => ({
                        id: 'space-' + art.id,
                        title: art.title,
                        source: art.news_site || 'Spaceflight News',
                        category: idx % 2 === 0 ? 'science' : 'tech',
                        url: art.url,
                        timeAgo: this.formatTimeAgo(new Date(art.published_at)),
                        isBreaking: idx === 0,
                        isLocal: false,
                        image: art.image_url || 'https://images.unsplash.com/photo-1517976487502-5f795777123c?w=600&auto=format&fit=crop&q=80',
                        summary: art.summary
                    }));

                    // Prepend live stories
                    this.articles = [...fetched, ...this.articles.slice(0, 8)];
                }
            }
        } catch (e) {
            console.log('Using cached news stream:', e.message);
        }

        this.tagLocalArticles();
        this.isLoading = false;
        if (this.callbacks.onLoading) this.callbacks.onLoading(false);
        if (this.callbacks.onArticlesUpdated) {
            this.callbacks.onArticlesUpdated(this.getFilteredArticles());
        }
    }

    formatTimeAgo(date) {
        const diffMs = Date.now() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    }

    setFilter(filterId) {
        this.currentFilter = filterId;
        if (this.callbacks.onArticlesUpdated) {
            this.callbacks.onArticlesUpdated(this.getFilteredArticles());
        }
    }

    setSearch(query) {
        this.searchQuery = (query || '').toLowerCase().trim();
        if (this.callbacks.onArticlesUpdated) {
            this.callbacks.onArticlesUpdated(this.getFilteredArticles());
        }
    }

    getFilteredArticles() {
        let list = [...this.articles];

        if (this.currentFilter === 'local') {
            list = list.filter(a => a.isLocal || a.category === 'local');
            if (list.length === 0) list = this.articles.slice(0, 4); // fallback graceful
        } else if (this.currentFilter !== 'all') {
            list = list.filter(a => a.category === this.currentFilter);
        }

        if (this.searchQuery) {
            const q = this.searchQuery;
            list = list.filter(a => {
                return a.title.toLowerCase().includes(q) ||
                       (a.summary || '').toLowerCase().includes(q) ||
                       a.source.toLowerCase().includes(q);
            });
        }

        return list;
    }

    getBreakingArticles() {
        return this.articles.filter(a => a.isBreaking || a.category === 'world').slice(0, 5);
    }

    getChannel(channelId) {
        return this.liveChannels.find(c => c.id === channelId) || this.liveChannels[0];
    }

    setActiveChannel(channelId) {
        const chan = this.getChannel(channelId);
        if (chan) {
            this.activeChannelId = chan.id;
            if (this.callbacks.onChannelChanged) {
                this.callbacks.onChannelChanged(chan);
            }
        }
    }

    setCustomStream(url) {
        let embedUrl = url.trim();
        // Extract YouTube ID if full URL
        const ytMatch = embedUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|live\/|watch\?.+&v=))([\w-]{11})/);
        if (ytMatch) {
            embedUrl = `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&mute=0`;
        }

        const customChan = {
            id: 'custom-' + Date.now(),
            name: 'Custom Live Feed',
            country: 'Direct Stream',
            code: 'LIVE',
            flag: '📡',
            category: 'custom',
            streamUrl: embedUrl,
            desc: `User configured live feed: ${url}`,
            viewers: 'Direct User Feed'
        };

        this.liveChannels.unshift(customChan);
        this.activeChannelId = customChan.id;
        if (this.callbacks.onChannelChanged) {
            this.callbacks.onChannelChanged(customChan);
        }
        return customChan;
    }
}

window.NewsHubEngine = NewsHubEngine;
