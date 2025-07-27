import { SetMetadata } from '@nestjs/common';

/**
 * API版本元数据键
 */
export const API_VERSION_METADATA = 'api_version';

/**
 * API版本装饰器
 * 用于标记控制器或方法的API版本
 */
export const ApiVersion = (version: string | string[]) =>
  SetMetadata(
    API_VERSION_METADATA,
    Array.isArray(version) ? version : [version],
  );

/**
 * 标记为废弃的API版本装饰器
 */
export const DeprecatedApiVersion = (
  version: string,
  deprecatedSince?: string,
  removalDate?: string,
) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    const existingVersions =
      Reflect.getMetadata(API_VERSION_METADATA, descriptor?.value || target) ||
      [];
    const deprecationInfo = {
      version,
      deprecated: true,
      deprecatedSince,
      removalDate,
    };

    Reflect.defineMetadata(
      API_VERSION_METADATA,
      [...existingVersions, deprecationInfo],
      descriptor?.value || target,
    );

    // 添加废弃信息元数据
    Reflect.defineMetadata(
      'api_deprecated',
      deprecationInfo,
      descriptor?.value || target,
    );
  };
};

/**
 * API版本信息接口
 */
export interface ApiVersionInfo {
  version: string;
  deprecated?: boolean;
  deprecatedSince?: string;
  removalDate?: string;
}

/**
 * 获取API版本信息
 */
export function getApiVersionInfo(target: any): ApiVersionInfo[] {
  return Reflect.getMetadata(API_VERSION_METADATA, target) || [];
}

/**
 * 检查API版本是否废弃
 */
export function isApiVersionDeprecated(target: any, version: string): boolean {
  const versionInfo = getApiVersionInfo(target);
  const info = versionInfo.find((v) => v.version === version);
  return info?.deprecated || false;
}
