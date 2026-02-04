interface CategoryCardProps {
    title: string;
    count: string;
    image: string;
}

export function CategoryCard({ title, count, image }: CategoryCardProps) {
    return (
        <button
            className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105"
        >
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            </div>
            <div className="relative h-full flex flex-col justify-end p-6 text-white">
                {/* <div className="bg-white/20 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center mb-3">
                </div> */}
                <h3 className="text-white mb-1">{title}</h3>
                <p className="text-white/80 text-sm">{count}</p>
            </div>
        </button>
    );
}
