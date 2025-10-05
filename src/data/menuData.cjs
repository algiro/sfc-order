// menuData.cjs - Backend menu data
module.exports = {
    cafes: [
        {
            id: 1,
            name: {
                es: "Cafe Expreso",
                en: "Espresso Coffee"
            },
            price: "1,30"
        },
        {
            id: 2,
            name: {
                es: "Expreso Doble",
                en: "Double Espresso"
            },
            price: "2,50"
        },
        {
            id: 3,
            name: {
                es: "Cortado Corto/Largo",
                en: "Short/Long Macchiato"
            },
            price: "1,40 / 1,50"
        },
        {
            id: 4,
            name: {
                es: "Café con Leche",
                en: "Coffee with Milk"
            },
            price: "1,80"
        },
        {
            id: 5,
            name: {
                es: "Café Mug",
                en: "Mug Coffee"
            },
            price: "2,10"
        },
        {
            id: 6,
            name: {
                es: "Cafe Americano",
                en: "American Coffee"
            },
            price: "1,70"
        },
        {
            id: 7,
            name: {
                es: "Leche y Leche corto/largo",
                en: "Milk and Coffee short/long"
            },
            price: "1,50 / 1,60"
        },
        {
            id: 8,
            name: {
                es: "Café bombón corto/largo",
                en: "Short/Long Bombón Coffee"
            },
            price: "1,40 / 1,50"
        },
        {
            id: 9,
            name: {
                es: "Chocolate",
                en: "Hot Chocolate"
            },
            price: "2,00"
        },
        {
            id: 10,
            name: {
                es: "Capuccino",
                en: "Cappuccino"
            },
            price: "2,00"
        },
        {
            id: 11,
            name: {
                es: "Copa Soul (chocolate,café, nata,sirope)",
                en: "Soul Cup (chocolate, coffee, cream, syrup)"
            },
            price: "4,10"
        },
        {
            id: 12,
            name: {
                es: "Barraquito",
                en: "Barraquito"
            },
            price: "2,20"
        },
        {
            id: 14,
            name: {
                es: "Flat White",
                en: "Flat White"
            },
            price: "3,00"
        },
        {
            id: 15,
            name: {
                es: "Affogato",
                en: "Affogato"
            },
            price: "4,50"
        },
        {
            id: 16,
            name: {
                es: "Babyccino",
                en: "Babyccino"
            },
            price: "2,00"
        }
    ],
    te: [
        {
            id: 1,
            name: {
                es: "Manzanilla, Tila, Menta Poleo",
                en: "Chamomile, Linden, Pennyroyal Mint"
            },
            price: "1,30"
        },
        {
            id: 2,
            name: {
                es: "Infusiones y tés a granel",
                en: "Bulk Teas and Infusions"
            },
            price: "pregunta por nuestros sabores 2,30"
        },
        {
            id: 3,
            name: {
                es: "Té Matcha",
                en: "Matcha Tea"
            },
            price: "2,60"
        },
        {
            id: 4,
            name: {
                es: "Leche dorada (Golden Milk)",
                en: "Golden Milk"
            },
            price: "2,60"
        },
        {
            id: 5,
            name: {
                es: "Té Chai",
                en: "Chai Tea"
            },
            price: "2,60"
        }
    ],
    bebidas: [
        {
            id: 1,
            name: {
                es: "Agua con y sin gas (0,50 cl)",
                en: "Still and Sparkling Water (0.50 cl)"
            },
            price: "1,30"
        },
        {
            id: 2,
            name: {
                es: "Zumo de Naranja (0,25 cl)",
                en: "Orange Juice (0.25 cl)"
            },
            price: "2,80"
        },
        {
            id: 3,
            name: {
                es: "Zumo de Naranja (0,38 cl)",
                en: "Orange Juice (0.38 cl)"
            },
            price: "3,80"
        },
        {
            id: 4,
            name: {
                es: "Kombucha (varios sabores disponibles)",
                en: "Kombucha (various flavors available)"
            },
            price: "3,00"
        },
        {
            id: 5,
            name: {
                es: "Appleteiser,Aquarius o Nestea",
                en: "Appleteiser, Aquarius or Nestea"
            },
            price: "2,00"
        },
        {
            id: 6,
            name: {
                es: "Refrescos",
                en: "Soft Drinks"
            },
            price: "1,70"
        },
        {
            id: 7,
            name: {
                es: "Tonica",
                en: "Tonic Water"
            },
            price: "2,20"
        },
        {
            id: 8,
            name: {
                es: "Malta",
                en: "Malt"
            },
            price: "1,60"
        },
        {
            id: 9,
            name: {
                es: "Bebida refrescante del dia (0,38 cl)",
                en: "Refreshing Drink of the Day (0.38 cl)"
            },
            price: "3,00"
        }
    ],
    tostas: [
        {
            id: 1,
            name: "Koko Taylor",
            ingredients: {
                es: "Huevo Duro, Aguacate Y Sésamo Negro",
                en: "Hard-boiled Egg, Avocado and Black Sesame"
            },
            tostaPrice: "6,00",
            pulgaPrice: "4,20",
            alergenos: {
                huevo: true,
                gluten: true,
                sesamo: true,
                frutoSecos: false,
                lacteos: false,
                vegan: false
            }
        },
        {
            id: 2,
            name: "Lauryn Hill",
            ingredients: {
                es: "Tomate, Aguacate, Yogur Y Pistacho",
                en: "Tomato, Avocado, Yogurt and Pistachio"
            },
            tostaPrice: "5,80",
            pulgaPrice: "4,00",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: true,
                lacteos: true,
                vegan: false
            },
            opcionVegana: true
        },
        {
            id: 3,
            name: "Sharon Jones",
            ingredients: {
                es: "Aguacate, Tomate Cherry y Mozzarella",
                en: "Avocado, Cherry Tomato and Mozzarella"
            },
            tostaPrice: "5,80",
            pulgaPrice: "4,00",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: false,
                lacteos: true,
                vegan: false
            }
        },
        {
            id: 4,
            name: "Joss Stone",
            ingredients: {
                es: "Aguacate, Queso semi curado, Almendra, Dátil Y Canela",
                en: "Avocado, Semi-cured Cheese, Almond, Date and Cinnamon"
            },
            tostaPrice: "6,45",
            pulgaPrice: "4,65",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: true,
                lacteos: true,
                vegan: false
            }
        },
        {
            id: 5,
            name: "Roberta Flack",
            ingredients: {
                es: "Mantequilla Y Mermelada",
                en: "Butter and Jam"
            },
            tostaPrice: "4,75",
            pulgaPrice: "3,00",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: false,
                lacteos: true,
                vegan: false
            },
            opcionVegana: true
        },
        {
            id: 6,
            name: "Billie Holiday",
            ingredients: {
                es: "Aove* Y Tomate",
                en: "Extra Virgin Olive Oil* and Tomato"
            },
            tostaPrice: "4,50",
            pulgaPrice: "3,00",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: false,
                lacteos: false,
                vegan: true
            },
            opcionVegana: false
        },
        {
            id: 7,
            name: "Amy Winehouse",
            ingredients: {
                es: "Tomate Cherry, Pesto Casero Y Queso De Cabra",
                en: "Cherry Tomato, Homemade Pesto and Goat Cheese"
            },
            tostaPrice: "6,00",
            pulgaPrice: "4,20",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: true,
                lacteos: true,
                vegan: false
            }
        },
        {
            id: 8,
            name: "Edith Piaf",
            ingredients: {
                es: "Aove*, Tomate, Tortilla Francesa Y Canónigos",
                en: "Extra Virgin Olive Oil*, Tomato, French Omelette and Lamb's Lettuce"
            },
            tostaPrice: "5,80",
            pulgaPrice: "4,00",
            alergenos: {
                huevo: true,
                gluten: true,
                sesamo: false,
                frutoSecos: false,
                lacteos: false,
                vegan: false
            }
        },
        {
            id: 9,
            name: "Nina Simone",
            ingredients: {
                es: "Pesto Casero, Canónigos, Queso Crema (disponible opción sin lactosa) Y Sésamo Negro",
                en: "Homemade Pesto, Lamb's Lettuce, Cream Cheese (lactose-free option available) and Black Sesame"
            },
            tostaPrice: "5,80",
            pulgaPrice: "4,00",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: true,
                frutoSecos: true,
                lacteos: true,
                vegan: false
            }
        },
        {
            id: 10,
            name: "Ella Fitzgerald",
            ingredients: {
                es: "Pesto Casero, Tomate Seco, Hummus Casero, Cebolla Roja Y Mozzarella",
                en: "Homemade Pesto, Sun-dried Tomato, Homemade Hummus, Red Onion and Mozzarella"
            },
            tostaPrice: "6,70",
            pulgaPrice: "4,90",
            alergenos: {
                huevo: false,
                gluten: true,
                sesamo: false,
                frutoSecos: true,
                lacteos: true,
                vegan: false
            },
            opcionVegana: false
        }
    ],
    arepas: [
        {
            id: 1,
            name: "Simon Dìaz",
            ingredients: {
                es: "Aguacate + queso tierno de vaca y cabra",
                en: "Avocado + fresh cow and goat cheese"
            },
            price: "4,80",
            alergenos: {
                lacteos: true
            }
        },
        {
            id: 2,
            name: "Reina Pepià",
            ingredients: {
                es: "Proteina de soja, guacamole, veganesa, guisantes",
                en: "Soy protein, guacamole, vegan mayo, peas"
            },
            price: "4,80",
            alergenos: {
                vegan: true
            }
        },
        {
            id: 3,
            name: "Soledad Bravo",
            ingredients: {
                es: "Huevo, tomate, cebolla, ajì dulce, mantequilla o margarina",
                en: "Egg, tomato, onion, sweet pepper, butter or margarine"
            },
            price: "4,80",
            alergenos: {
                lacteos: true,
                huevo: true
            }
        },
        {
            id: 4,
            name: "Franco de Vita",
            ingredients: {
                es: "Queso tierno de vaca y cabra, plátano frito",
                en: "Fresh cow and goat cheese, fried plantain"
            },
            price: "4,70",
            alergenos: {
                lacteos: true
            }
        },
        {
            id: 5,
            name: "Billo's Caracas Boys",
            ingredients: {
                es: "queso tierno de vaca y cabra, mantequilla o margarina",
                en: "fresh cow and goat cheese, butter or margarine"
            },
            price: "4,80",
            alergenos: {
                lacteos: true
            }
        },
        {
            id: 6,
            name: "Desorden Pùblico",
            ingredients: {
                es: "Salchicha de proteina de guisantes, veganesa, guisantes, cebolla (opcional)",
                en: "Pea protein sausage, vegan mayo, peas, onion (optional)"
            },
            price: "4,80",
            alergenos: {
                vegan: true
            }
        },
        {
            id: 7,
            name: "Arepitas Dulces",
            ingredients: {
                es: "Arepa frita, panela, matalauva",
                en: "Fried arepa, brown sugar cane, anise"
            },
            price: "2,50",
            alergenos: {
                vegan: true
            }
        },
        {
            id: 8,
            name: "Arepitas Dulces con queso",
            ingredients: {
                es: "Arepa frita, Panela, queso tierno de vaca y cabra , Matalauva",
                en: "Fried arepa, brown sugar cane, fresh cow and goat cheese, anise"
            },
            price: "2,75",
            alergenos: {
                vegan: false
            }
        }
    ]
};
