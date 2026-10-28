from engine.extraction.parsers import (
    land_deed, trust_cert, faculty_list, fire_noc
)

PARSER_MAP = {
    "land_deed":         land_deed.parse,
    "trust_certificate": trust_cert.parse,
    "faculty_list":      faculty_list.parse,
    "fire_noc":          fire_noc.parse,
}

__all__ = ["PARSER_MAP"]
