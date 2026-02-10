// Rule-based categorization for expense titles
// Returns exactly one category string from the allowed list.

const CATEGORIES = {
    FOOD_GROCERY: "Food & Grocery",
    EATING_OUT: "Eating Out",
    RENT: "Rent & Housing",
    UTILITIES: "Utilities",
    HOUSEHOLD: "Household Items",
    SHOPPING: "Shopping",
    ENTERTAINMENT: "Entertainment",
    SPORTS_HEALTH: "Sports / Health",
    SERVICES: "Services",
    MISC: "Misc",
};

const RULES = [
    // Food & Grocery - comprehensive grocery and cooking ingredients (most specific first)
    { keywords: ["aata", "rice", "dal", "paneer", "butter", "oil", "masala", "vegetable", "dahi", "curd", "milk", "cheese", "onion", "tomato", "potato", "brinjal", "palak", "kanda", "baigan", "peas", "chilli", "pepper", "salt", "vinegar", "bread", "suji", "shewai", "maggi", "khichdi", "gajar", "garam masala", "bhindi", "pav", "poha", "grocery", "groceries", "supermarket", "store", "mart", "dmart"], category: CATEGORIES.FOOD_GROCERY },

    // Eating Out - restaurants, food delivery, prepared meals
    { keywords: ["coffee", "dosa", "misal", "samosa", "thali", "paratha", "waffle", "zomato", "dinner", "lunch", "bhel", "vadapav", "ice cream", "shreekhand", "biryani", "chicken", "fried rice", "kadhai", "burger", "food", "restaurant", "breakfast", "cafe", "eat", "snack", "meal", "canteen", "pizza", "takeaway"], category: CATEGORIES.EATING_OUT },

    // Rent & Housing - accommodation and home fixtures
    { keywords: ["rent", "mattress", "door bell", "laundry bag", "pillow", "lease", "house rent", "rental", "furniture"], category: CATEGORIES.RENT },

    // Utilities - bills and essential services
    { keywords: ["light bill", "electricity", "wifi", "gas", "ro", "water", "recharge", "internet", "power", "utility", "utilities", "broadband", "cylinder refill", "bill"], category: CATEGORIES.UTILITIES },

    // Household Items - cleaning and home maintenance
    { keywords: ["detergent", "soap", "brush", "tape", "kitchen", "bucket", "mug", "scotch", "trash", "bag", "spray", "cleaning", "iron", "spatula", "knife", "glass cleaner", "toothpaste", "vim bar", "handwash", "dishwash", "mop", "odonil", "sponge", "cofsils", "rin", "ariel", "dettol", "measuring tape", "cloth", "wash", "broom", "duster", "toilet", "tissue", "utensil", "household"], category: CATEGORIES.HOUSEHOLD },

    // Shopping - retail purchases and clothing
    { keywords: ["amazon", "flipkart", "shopping", "socks", "sweatshirt", "jacket", "watch", "cap", "shirt", "shoes", "extension board", "meesho", "cricket bat", "bat", "dmart items", "dress", "outfit", "buy", "purchase", "mall", "store", "online"], category: CATEGORIES.SHOPPING },

    // Entertainment - recreational activities and subscriptions
    { keywords: ["movie", "netflix", "prime", "theatre", "youtube", "yt premium", "tennis", "badminton", "cricket", "turf", "swimming", "concert", "show", "entertainment", "game", "play", "subscription"], category: CATEGORIES.ENTERTAINMENT },

    // Sports / Health - fitness and medical
    { keywords: ["gym", "fitness", "doctor", "clinic", "pharmacy", "medicine", "health", "sport", "hospital", "massage", "scalp massager", "ayurveda", "skincare", "meswak", "health care"], category: CATEGORIES.SPORTS_HEALTH },

    // Services - repair, transportation, professional services
    { keywords: ["taxi", "bus", "petrol", "rickshaw", "transport", "parking", "cook", "repair", "service", "shift", "transport shifting", "photocopy", "professional", "mechanic", "plumber", "electrician", "subscription", "cab", "uber", "ola", "laundry", "dryclean"], category: CATEGORIES.SERVICES },
];

export function categorizeTitle(title) {
    const t = String(title || "").toLowerCase();

    // Apply rules in order; first match wins
    for (const rule of RULES) {
        for (const kw of rule.keywords) {
            if (t.includes(kw)) return rule.category;
        }
    }

    return CATEGORIES.MISC;
}

export function getCategoryList() {
    return Object.values(CATEGORIES);
}
