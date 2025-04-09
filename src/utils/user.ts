import { $Enums } from "@prisma/client";

export function getUserTypeFromString(userType: string): $Enums.UserType {
  userType = userType || "";
  switch (userType?.toLowerCase()) {
    case "membro":
      return $Enums.UserType.Membro;
    case "anunciante":
      return $Enums.UserType.Anunciante;
    default:
      return $Enums.UserType.Membro;
  }
}
