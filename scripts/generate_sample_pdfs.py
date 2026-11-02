import os

def create_pdf(filepath, title, pages_content):
    """
    Generates a valid, standard PDF 1.4 file with text streams.
    """
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    
    objects = []
    
    # We will accumulate objects and their byte offsets
    def add_object(content):
        objects.append(content)
        return len(objects)

    # 1: Catalog
    # 2: Outlines
    # 3: Pages
    catalog_id = 1
    outlines_id = 2
    pages_id = 3
    
    page_ids = []
    page_contents = []

    # Reserve 1, 2, 3
    objects.extend(["", "", ""])

    for page_idx, lines in enumerate(pages_content):
        # Text stream
        stream_lines = ["BT", "/F1 14 Tf", "40 780 Td", f"({title} - Page {page_idx + 1}) Tj", "/F1 10 Tf", "0 -30 Td"]
        for line in lines:
            escaped = line.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
            stream_lines.append(f"({escaped}) Tj")
            stream_lines.append("0 -16 Td")
        stream_lines.append("ET")
        stream_data = "\n".join(stream_lines).encode("latin1")

        content_id = len(objects) + 1
        objects.append(
            f"{content_id} 0 obj\n<< /Length {len(stream_data)} >>\nstream\n"
            + stream_data.decode("latin1")
            + "\nendstream\nendobj"
        )

        page_id = len(objects) + 1
        page_ids.append(page_id)
        objects.append(
            f"{page_id} 0 obj\n<< /Type /Page /Parent {pages_id} 0 R /MediaBox [0 0 612 792] /Contents {content_id} 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj"
        )

    # Now fill 1, 2, 3
    objects[0] = f"1 0 obj\n<< /Type /Catalog /Pages {pages_id} 0 R /Outlines {outlines_id} 0 R >>\nendobj"
    objects[1] = f"2 0 obj\n<< /Type /Outlines /Count 0 >>\nendobj"
    kids_str = " ".join([f"{pid} 0 R" for pid in page_ids])
    objects[2] = f"3 0 obj\n<< /Type /Pages /Kids [{kids_str}] /Count {len(page_ids)} >>\nendobj"

    # Assemble PDF with cross reference table
    output = bytearray()
    output.extend(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    
    offsets = []
    for obj in objects:
        offsets.append(len(output))
        output.extend(obj.encode("latin1"))
        output.extend(b"\n")

    xref_offset = len(output)
    output.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin1"))
    output.extend(b"0000000000 65535 f \n")
    for off in offsets:
        output.extend(f"{off:010d} 00000 n \n".encode("latin1"))

    output.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin1")
    )

    with open(filepath, "wb") as f:
        f.write(output)
    print(f"Created {filepath} ({len(output)} bytes)")


# Generate Sample 1: Biology
create_pdf(
    "public/samples/biology_photosynthesis.pdf",
    "Biology: Photosynthesis and Energy",
    [
        [
            "Chapter 8: Energy and Life in Plants",
            "Photosynthesis is the biological process by which green plants, algae,",
            "and cyanobacteria convert solar light energy into chemical energy stored in glucose.",
            "This critical reaction takes place within specialized organelles called chloroplasts,",
            "which contain the light-absorbing pigment chlorophyll.",
            "",
            "The balanced chemical equation for photosynthesis is:",
            "6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2",
            "",
            "Carbon dioxide enters the leaves through microscopic pores called stomata,",
            "while water is drawn up from the soil through root xylem vessels.",
            "During the light-dependent reactions, sunlight splits water molecules (photolysis),",
            "releasing oxygen as a byproduct and charging ATP and NADPH molecules."
        ],
        [
            "Stage 2: The Calvin Cycle (Light-Independent Reactions)",
            "The Calvin cycle occurs in the stroma, the fluid-filled interior of the chloroplast.",
            "Using the chemical energy carried by ATP and NADPH, carbon dioxide from the",
            "atmosphere is fixed into carbohydrate building blocks like G3P.",
            "",
            "Key limiting factors affecting the rate of photosynthesis include:",
            "1. Light intensity: Increases rate up to a saturation threshold.",
            "2. Carbon dioxide concentration: Higher availability accelerates Calvin cycle fixing.",
            "3. Temperature: Moderate warmth promotes enzyme action; above 40C, RuBisCO denatures."
        ]
    ]
)

# Generate Sample 2: World History
create_pdf(
    "public/samples/history_printing_press.pdf",
    "World History: Gutenberg Printing Press",
    [
        [
            "Unit 4: The Information Revolution in Europe",
            "Around 1440 in Mainz, Germany, goldsmith Johannes Gutenberg invented the",
            "movable metal type printing press. Before Gutenberg, every book in Europe",
            "had to be painstakingly copied by hand by scribes or block-printed on wood.",
            "",
            "Gutenberg combined three breakthrough innovations:",
            "1. Durable movable type cast from an alloy of lead, tin, and antimony.",
            "2. Specially formulated oil-based ink that adhered firmly to metal surfaces.",
            "3. A heavy wooden screw press adapted from agricultural wine presses.",
            "",
            "The Gutenberg Bible of 1455 proved that mechanically printed books could",
            "match the beauty of illuminated manuscripts while producing dozens of copies at once."
        ],
        [
            "Social and Cultural Impact",
            "Within 50 years of Gutenberg's invention, print shops operated in over 250 European cities,",
            "producing an estimated 20 million volumes by 1500.",
            "",
            "Major consequences included:",
            "- Book costs plummeted by over 80 percent, dramatically expanding public literacy.",
            "- Scientific findings could be replicated, cross-checked, and distributed across borders.",
            "- Martin Luther's 95 Theses spread across Europe in weeks, accelerating the Reformation."
        ]
    ]
)

# Generate Sample 3: Physics
create_pdf(
    "public/samples/physics_newtons_laws.pdf",
    "Physics: Newton's Laws of Motion",
    [
        [
            "Classical Mechanics: Principles of Motion and Dynamics",
            "Sir Isaac Newton published his three fundamental laws of motion in 1687.",
            "These laws govern the motion of all macroscopic objects.",
            "",
            "First Law (Law of Inertia):",
            "An object remains at rest or in uniform straight-line motion unless acted",
            "upon by a non-zero net external force. Mass is the measure of inertia.",
            "",
            "Second Law (Force and Acceleration):",
            "The net force applied to an object equals its mass multiplied by its acceleration:",
            "F = m * a",
            "Force is measured in Newtons (N), where 1 Newton equals 1 kg * m/s^2."
        ],
        [
            "Third Law (Action and Reaction):",
            "For every action force, there is an equal and opposite reaction force.",
            "Whenever body A exerts a force on body B, body B exerts an equal force in",
            "the opposite direction on body A.",
            "",
            "Important rule: Action and reaction forces act on different bodies,",
            "which is why they never cancel each other out.",
            "Example: A rocket accelerates forward because its engines expel exhaust gases backward."
        ]
    ]
)

# Generate an empty / unreadable scanned-like PDF to test error handling
create_pdf(
    "public/samples/empty_test_file.pdf",
    "",
    [[]]
)
print("All sample PDFs generated successfully.")
