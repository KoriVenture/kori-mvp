import Image from "next/image";

type KoriLogoProps = {
  priority?: boolean;
};

export function KoriLogo({ priority = false }: KoriLogoProps) {
  return (
    <span className="inline-flex" role="img" aria-label="Kori">
      <Image
        src="/brand/kori-lockup-light.svg"
        width={138}
        height={42}
        alt=""
        priority={priority}
        className="h-8 w-auto dark:hidden"
      />
      <Image
        src="/brand/kori-lockup-dark.svg"
        width={138}
        height={42}
        alt=""
        priority={priority}
        className="hidden h-8 w-auto dark:block"
      />
    </span>
  );
}
