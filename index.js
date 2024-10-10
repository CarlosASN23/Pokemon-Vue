const { createApp } = Vue;

createApp({
    data() {
        return {
            pokemons: [],
            loading: true,
            searchText: '',
            nextPage: 1,
            typeColors: {
                fire: '#c27e10',
                grass: '#4CAF50',
                water: '#00BFFF',
                bug: '#98e880',
                normal: '#A9A9A9',
                poison: '#9e5cda',
                electric: '#ffd365',
                ground: '#9e7e52',
                ghost: '#5626de',
                fighting: '#ba082a',
                psychic: '#e39fa4',
                rock: '#897975',
                ice: '#42bed3',
                steel: '#999999',
                dark: '#12124f',
                flying: '#23f1c7',
                fairy: '#f040f3',
                dragon: '#3263cc',
            }
        }
    },
    created() {
        console.log("Componente criado.");
        this.callAPI();
        window.addEventListener('scroll', this.handleScroll);
        this.generateTypeCombinations();
    },
    beforeUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    },
    computed: {
        filteredPokemons() {
            console.log("Filtrando pokémons:", this.searchText);
            return this.pokemons.filter(pokemon => pokemon.name.toLowerCase().includes(this.searchText.toLowerCase()));
        }
    },
    methods: {
        async callAPI() {
            console.log("Chamando API...");
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${(this.nextPage - 1) * 20}&limit=20`);
                if (!response.ok) throw new Error("Erro na resposta da API");
                const data = await response.json();
                const pokemonDetailsPromises = data.results.map(pokemon => this.fetchPokemonData(pokemon.url));
                const pokemonDetails = await Promise.all(pokemonDetailsPromises);
                this.pokemons = [...this.pokemons, ...pokemonDetails];
                this.nextPage++;
                this.loading = false;
                console.log("Pokémons carregados:", this.pokemons);
            } catch (error) {
                console.error("Erro na chamada da API:", error);
                this.loading = false;
            }
        },
        async fetchPokemonData(url) {
            console.log("Buscando dados do Pokémon:", url);
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error("Erro ao buscar dados do Pokémon");
                const data = await response.json();
                return {
                    id: data.id,
                    name: data.name,
                    weight: data.weight,
                    types: data.types || [],
                    sprites: data.sprites,
                    showDetails: false,
                }
            } catch (e) {
                console.error("Erro ao buscar dados do Pokémon:", e);
                return null;
            }
        },
        handleScroll() {
            const bottomOfWindow = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
            if (bottomOfWindow && !this.loading) {
                console.log("Chegou ao fim da página, carregando mais...");
                this.loading = true;
                this.callAPI();
            }
        },
        getTypeClass(pokemon) {
            if (!pokemon || !pokemon.types || pokemon.types.length === 0) {
                return '';
            }
            if (pokemon.types.length > 1) {
                const type1 = pokemon.types[0].type.name;
                const type2 = pokemon.types[1].type.name;
                return `${type1}-${type2}`;
            }
            return pokemon.types[0].type.name;
        },
        generateTypeCombinations() {
            const typeKeys = Object.keys(this.typeColors);
            typeKeys.forEach((type1) => {
                typeKeys.forEach((type2) => {
                    if (type1 !== type2) {
                        const className = `${type1}-${type2}`;
                        const style = document.createElement('style');
                        style.type = 'text/css';
                        style.innerHTML = `
                            .${className} {
                                background: linear-gradient(to right, ${this.typeColors[type1]} 50%, ${this.typeColors[type2]} 50%);
                            }
                        `;
                        document.getElementsByTagName('head')[0].appendChild(style);
                    }
                });
            });
        }
    }
}).mount("#app");
